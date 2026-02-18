#!/usr/bin/env bun
/**
 * ReconcileOrchestrator.ts — Deterministic reconcile orchestrator for the Analyse skill.
 *
 * Replaces the LLM-prompt orchestrator (Reconcile.md) with TypeScript.
 * ~85% deterministic. One LLM call per section for smart deduplication (via Inference.ts).
 *
 * Usage:
 *   bun ReconcileOrchestrator.ts <profile>
 *
 * Exit codes:
 *   0 = all entries reconciled successfully
 *   1 = one or more entries failed
 */

import { spawn } from "child_process";
import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, basename, dirname } from "path";
import { homedir } from "os";

import {
  loadManifest,
  saveManifest,
  filterPendingReconcile,
  SKILL_DIR,
  KB_ROOT,
  type ReviewEntry,
  type ExtractionSection,
} from "./lib/manifest";
import { updateFrontmatter } from "./lib/frontmatter";

// ── Constants ──────────────────────────────────────────────────────────────

const INFERENCE_PATH = resolve(homedir(), ".claude/skills/CORE/Tools/Inference.ts");

const ORPHANS_PATH = resolve(KB_ROOT, "McCullonas/Orphans.md");

// Section key → markdown heading in Product.md
const SECTION_HEADINGS: Record<string, string> = {
  overview: "## Overview",
  status: "## Status",
  target_users: "## Target Users",
  value_proposition: "## Value Proposition",
  differentiators: "## Differentiators",
  features: "## Features",
  limitations: "## Limitations",
  dependencies: "## Dependencies",
  commercial_model: "## Commercial Model",
  use_cases: "## Use Cases",
  clients: "## Clients",
  references: "## References",
};

const EXTRACTION_SECTIONS = Object.keys(SECTION_HEADINGS);

// ── CLI Parsing ────────────────────────────────────────────────────────────

function parseCLI() {
  const { positionals } = parseArgs({ allowPositionals: true });
  const profile = positionals[0];

  if (!profile) {
    console.error("Usage: bun ReconcileOrchestrator.ts <profile>");
    process.exit(2);
  }

  return { profile };
}

// ── Voice Notification ─────────────────────────────────────────────────────

function notify(message: string): void {
  try {
    const proc = spawn("curl", [
      "-s", "-X", "POST", "http://localhost:8888/notify",
      "-H", "Content-Type: application/json",
      "-d", JSON.stringify({ message }),
    ], { stdio: "ignore", detached: true });
    proc.unref();
  } catch {
    // Non-fatal
  }
}

// ── Smart Dedup via Inference ──────────────────────────────────────────────

interface DedupResult {
  action: "skip" | "merge" | "append";
  content: string;
}

async function smartDedup(existing: string, incoming: string): Promise<DedupResult> {
  // If existing section is empty, always append
  if (!existing.trim()) {
    return { action: "append", content: incoming };
  }

  // If incoming is empty, skip
  if (!incoming.trim()) {
    return { action: "skip", content: "" };
  }

  const systemPrompt = `Compare EXISTING section content against INCOMING extraction.
Return JSON: {"action": "skip|merge|append", "content": "..."}
- skip: incoming is a duplicate of existing (content ignored)
- merge: same topic but new details — return ONLY novel parts
- append: genuinely new — return incoming as-is
When uncertain, choose append.
Return ONLY the JSON object, no explanation.`;

  const userPrompt = `EXISTING:\n${existing}\n\nINCOMING:\n${incoming}`;

  try {
    // Use Inference.ts via import
    const { inference } = await import(INFERENCE_PATH);
    const result = await inference({
      systemPrompt,
      userPrompt,
      level: "fast",
      expectJson: true,
      timeout: 15000,
    });

    if (result.success && result.parsed) {
      const parsed = result.parsed as any;
      if (parsed.action && typeof parsed.content === "string") {
        return { action: parsed.action, content: parsed.content };
      }
    }

    // Fallback: append (safe default per Reconcile.md — err towards completeness)
    return { action: "append", content: incoming };
  } catch {
    // LLM failure fallback: append
    return { action: "append", content: incoming };
  }
}

// ── Markdown Section Operations ────────────────────────────────────────────

/**
 * Extract content of a specific heading section from markdown.
 * Returns everything between the heading and the next heading of same or higher level.
 */
function extractSection(markdown: string, heading: string): string {
  const headingLevel = heading.match(/^#+/)?.[0].length || 2;
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `${escapedHeading}\\s*\\n([\\s\\S]*?)(?=\\n#{1,${headingLevel}}\\s|$)`
  );
  const match = markdown.match(pattern);
  return match ? match[1].trim() : "";
}

/**
 * Append content to a section. If section doesn't exist, create it.
 */
function appendToSection(markdown: string, heading: string, newContent: string): string {
  const headingLevel = heading.match(/^#+/)?.[0].length || 2;
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(${escapedHeading}\\s*\\n[\\s\\S]*?)(?=\\n#{1,${headingLevel}}\\s|$)`
  );
  const match = markdown.match(pattern);

  if (match) {
    // Section exists — append to it
    const existingSection = match[1].trimEnd();
    const updated = `${existingSection}\n\n${newContent}`;
    return markdown.replace(match[1], updated);
  } else {
    // Section doesn't exist — append before References or at end
    const refIdx = markdown.indexOf("## References");
    if (refIdx > 0) {
      return markdown.slice(0, refIdx) + `${heading}\n\n${newContent}\n\n` + markdown.slice(refIdx);
    }
    return markdown.trimEnd() + `\n\n${heading}\n\n${newContent}\n`;
  }
}

// ── Process Single Entry ───────────────────────────────────────────────────

interface ReconcileResult {
  success: boolean;
  sourceFile: string;
  products: string[];
  sectionsUpdated: string[];
  orphansAdded: number;
  error?: string;
}

async function reconcileEntry(
  entry: ReviewEntry,
  profile: string,
  today: string
): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    success: true,
    sourceFile: entry.source_file,
    products: [],
    sectionsUpdated: [],
    orphansAdded: 0,
  };

  try {
    // Process each routed product
    for (const routedTo of entry.routed_to) {
      const productDir = resolve(KB_ROOT, routedTo);
      const productPath = resolve(productDir, "Product.md");

      // Load or create Product.md
      let productContent: string;
      if (existsSync(productPath)) {
        productContent = readFileSync(productPath, "utf-8");
      } else {
        // Create minimal Product.md from template
        mkdirSync(productDir, { recursive: true });
        const productName = basename(routedTo);
        productContent = `# ${productName}\n\n## Overview\n\n## Status\n\n## Target Users\n\n## Value Proposition\n\n## Differentiators\n\n## Features\n\n## Limitations\n\n## Dependencies\n\n## Commercial Model\n\n## Use Cases\n\n## Clients\n\n## References\n`;
      }

      // Process each extraction section
      for (const sectionKey of EXTRACTION_SECTIONS) {
        const extraction = entry.extractions[sectionKey as keyof typeof entry.extractions] as ExtractionSection | undefined;
        if (!extraction || !extraction.content.trim()) continue;

        const heading = SECTION_HEADINGS[sectionKey];
        if (!heading) continue;

        // Confidence gate
        let contentToAdd: string;
        if (extraction.confidence === "low") {
          // Low confidence → add to Pending Review section
          const pendingHeading = "## Pending Review";
          const pendingContent = `### ${sectionKey} (Low Confidence)\n<!-- source: analyse/${profile}/${today} -->\n${extraction.content}\n*Source: ${entry.source_file} (${today})*`;
          productContent = appendToSection(productContent, pendingHeading, pendingContent);
          result.sectionsUpdated.push(`${sectionKey} (pending)`);
          continue;
        }

        if (extraction.confidence === "medium") {
          contentToAdd = `*[Inferred from source]* ${extraction.content}`;
        } else {
          contentToAdd = extraction.content;
        }

        // Smart dedup
        const existingContent = extractSection(productContent, heading);
        const dedup = await smartDedup(existingContent, contentToAdd);

        if (dedup.action === "skip") {
          // Duplicate — add corroborating source citation only
          const citation = `\n*Corroborated by: ${entry.source_file} (${today})*`;
          if (existingContent && !existingContent.includes(entry.source_file)) {
            productContent = appendToSection(productContent, heading, citation);
          }
          continue;
        }

        // Add provenance marker and content
        const finalContent = dedup.action === "merge" ? dedup.content : contentToAdd;
        const provenanced = `<!-- source: analyse/${profile}/${today} -->\n${finalContent}\n*Source: ${entry.source_file} (${today})*`;
        productContent = appendToSection(productContent, heading, provenanced);
        result.sectionsUpdated.push(sectionKey);
      }

      // Add reference entry
      const refContent = `[${entry.source_file}]\n    Path: ${entry.source_file}\n    Reviewed: ${today}\n    Profile: ${profile}`;
      productContent = appendToSection(productContent, "## References", refContent);

      // Write Product.md
      writeFileSync(productPath, productContent, "utf-8");
      result.products.push(routedTo);
    }

    // Handle orphans
    if (entry.orphans && entry.orphans.length > 0) {
      let orphansContent = "";
      if (existsSync(ORPHANS_PATH)) {
        orphansContent = readFileSync(ORPHANS_PATH, "utf-8");
      } else {
        const orphansDir = dirname(ORPHANS_PATH);
        if (!existsSync(orphansDir)) mkdirSync(orphansDir, { recursive: true });
        orphansContent = "# Orphan Topics\n\nTopics that don't fit existing product categories.\n\n## Pending Review\n";
      }

      for (const orphan of entry.orphans) {
        const orphanEntry = `\n### ${orphan.topic}\n**Source:** \`${entry.source_file}\`\n**Added:** ${today}\n**Status:** pending_review\n**Why orphan:** ${orphan.description}\n**Suggested action:** ${orphan.suggested_action}\n**Notes:** ${orphan.notes}\n`;
        orphansContent += orphanEntry;
        result.orphansAdded++;
      }

      writeFileSync(ORPHANS_PATH, orphansContent, "utf-8");
    }

    // Update source file frontmatter
    const sourceAbsPath = resolve(KB_ROOT, entry.source_file);
    if (existsSync(sourceAbsPath)) {
      try {
        const sourceContent = readFileSync(sourceAbsPath, "utf-8");
        const updatedSource = updateFrontmatter(sourceContent, profile, {
          status: "reconciled",
          reconciled_at: new Date().toISOString(),
        });
        writeFileSync(sourceAbsPath, updatedSource, "utf-8");
      } catch {
        // Non-fatal — frontmatter update failure doesn't block reconciliation
      }
    }
  } catch (e: any) {
    result.success = false;
    result.error = e.message;
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseCLI();
  const today = new Date().toISOString().split("T")[0];

  // Validate profile
  const profileDir = resolve(SKILL_DIR, "Profiles", args.profile.charAt(0).toUpperCase() + args.profile.slice(1));
  if (!existsSync(profileDir)) {
    console.error(`ERROR: Profile not found: ${profileDir}`);
    process.exit(2);
  }

  // Voice notification
  notify(`Running the Reconcile workflow in the Analyse skill to merge extractions into product documentation`);
  console.log(`\nRunning the Reconcile workflow in the Analyse skill...`);

  // Load manifest and filter pending
  const manifest = loadManifest();
  const pending = filterPendingReconcile(manifest, args.profile);

  if (pending.length === 0) {
    console.log(`\nNo pending reconciliations for profile: ${args.profile}.`);
    console.log(`All extractions have been reconciled.`);
    process.exit(0);
  }

  // Report plan
  console.log(`\n## Reconcile Plan\n`);
  console.log(`Profile: ${args.profile}`);
  console.log(`Pending entries: ${pending.length}`);
  console.log(`\nEntries to reconcile:`);
  for (let i = 0; i < pending.length; i++) {
    const e = pending[i];
    console.log(`  ${i + 1}. ${e.source_file} → ${e.routed_to.join(", ")} (${e.confidence})`);
  }
  console.log(`\nProceeding with reconciliation...\n`);

  // Process each entry sequentially (order matters for dedup)
  const results: ReconcileResult[] = [];
  const productUpdates: Record<string, string[]> = {};

  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i];
    console.log(`Processing ${i + 1}/${pending.length}: ${entry.source_file}`);

    const result = await reconcileEntry(entry, args.profile, today);
    results.push(result);

    // Update manifest entry
    const manifestIdx = manifest.findIndex(
      (m) => m.source_file === entry.source_file && m.profile === args.profile
    );
    if (manifestIdx >= 0) {
      if (result.success) {
        manifest[manifestIdx].status = "reconciled";
        manifest[manifestIdx].reconciled_at = new Date().toISOString();
      }
    }

    // Track product updates
    for (const product of result.products) {
      if (!productUpdates[product]) productUpdates[product] = [];
      productUpdates[product].push(...result.sectionsUpdated);
    }

    // Progress
    if (result.success) {
      const sections = result.sectionsUpdated.length > 0
        ? result.sectionsUpdated.join(", ")
        : "no new sections";
      console.log(`  ✅ → ${result.products.join(", ")} | Sections: ${sections}${result.orphansAdded > 0 ? ` | Orphans: ${result.orphansAdded}` : ""}`);
    } else {
      console.log(`  ❌ FAILED: ${result.error}`);
    }
  }

  // Save updated manifest
  saveManifest(manifest);

  // Summary
  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalOrphans = results.reduce((sum, r) => sum + r.orphansAdded, 0);
  const allSections = results.flatMap((r) => r.sectionsUpdated);
  const lowConfidence = allSections.filter((s) => s.includes("(pending)")).length;

  console.log(`\n## Reconcile Complete\n`);
  console.log(`Profile: ${args.profile}`);
  console.log(`Entries reconciled: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Orphans added: ${totalOrphans}`);
  console.log(`Low-confidence items flagged: ${lowConfidence}`);

  if (Object.keys(productUpdates).length > 0) {
    console.log(`\nChanges by product:`);
    for (const [product, sections] of Object.entries(productUpdates)) {
      const unique = [...new Set(sections)];
      console.log(`  ${product}/Product.md: ${unique.join(", ")}`);
    }
  }

  if (failed > 0) {
    console.log(`\nFailed entries:`);
    for (const r of results.filter((r) => !r.success)) {
      console.log(`  ❌ ${r.sourceFile}: ${r.error}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

// ── Run ────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(2);
});
