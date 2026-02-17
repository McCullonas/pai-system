#!/usr/bin/env bun
/**
 * ReviewOrchestrator.ts — Deterministic review orchestrator for the Analyse skill.
 *
 * Replaces the LLM-prompt orchestrator (Review.md) with TypeScript.
 * Uses `claude --print` to spawn FileAgent per file.
 * All logistics (file listing, batching, polling, progress) are deterministic code.
 *
 * Usage:
 *   bun ReviewOrchestrator.ts <profile> <target> [--force] [--light] [--apply] [--max N] [--retry] [--timeout N]
 *
 * Exit codes:
 *   0 = all files succeeded (or no files to process)
 *   1 = one or more files failed
 */

import { spawn, type ChildProcess } from "child_process";
import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { resolve, relative, basename } from "path";
import { homedir } from "os";

import { loadManifest, countPendingReconcile, isFileReviewed, MANIFEST_PATH, TEMP_DIR, SKILL_DIR, KB_ROOT } from "./lib/manifest";
import { buildFileList, slugify, findOrphanedTempFiles, findOrphanedSignalFiles } from "./lib/files";
import { hasProfileReview } from "./lib/frontmatter";

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_CAP = 30;
const DEFAULT_MAX = 20;
const BATCH_SIZE = 3;
const TIMEOUT_FULL_MS = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_LIGHT_MS = 3 * 60 * 1000; // 3 minutes
const PROMPT_PATH = resolve(SKILL_DIR, "Workflows/FileAgent.prompt.txt");

// ── CLI Parsing ────────────────────────────────────────────────────────────

function parseCLI() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      force: { type: "boolean", default: false },
      light: { type: "boolean", default: false },
      apply: { type: "boolean", default: false },
      max: { type: "string", default: String(DEFAULT_MAX) },
      retry: { type: "boolean", default: false },
      timeout: { type: "string" },
    },
  });

  const profile = positionals[0];
  const target = positionals[1];
  const isRetry = values.retry ?? false;

  if (!profile || (!target && !isRetry)) {
    console.error("Usage: bun ReviewOrchestrator.ts <profile> <target> [--force] [--light] [--apply] [--max N] [--retry] [--timeout N]");
    console.error("       bun ReviewOrchestrator.ts <profile> --retry [--timeout N] [--light]");
    process.exit(2);
  }

  const maxVal = Math.min(parseInt(values.max || String(DEFAULT_MAX), 10) || DEFAULT_MAX, MAX_CAP);

  return {
    profile,
    target: target ? resolve(target) : "",
    force: values.force ?? false,
    light: values.light ?? false,
    apply: values.apply ?? false,
    max: maxVal,
    retry: values.retry ?? false,
    timeout: values.timeout ? parseInt(values.timeout, 10) * 1000 : undefined,
  };
}

// ── Signal File Parsing ────────────────────────────────────────────────────

interface SignalResult {
  success: boolean;
  filePath: string;
  routedTo?: string;
  confidence?: string;
  mode?: string;
  error?: string;
}

function parseSignal(line: string): SignalResult {
  const parts = line.trim().split("|");
  if (parts[0] === "DONE") {
    return {
      success: true,
      filePath: parts[1] || "",
      routedTo: parts[2] || "",
      confidence: parts[3] || "",
      mode: parts[4] || "",
    };
  }
  return {
    success: false,
    filePath: parts[1] || "",
    error: parts[2] || "unknown error",
  };
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

// ── FileAgent Spawning ─────────────────────────────────────────────────────

function spawnFileAgent(
  promptTemplate: string,
  filePath: string,
  profile: string,
  mode: string,
  slug: string,
  timeoutMs: number
): Promise<SignalResult> {
  return new Promise((resolvePromise) => {
    const Profile = profile.charAt(0).toUpperCase() + profile.slice(1);
    const sourceRelative = relative(KB_ROOT, filePath);

    // Substitute variables into prompt
    const prompt = promptTemplate
      .replace(/\{file_path\}/g, filePath)
      .replace(/\{profile\}/g, profile)
      .replace(/\{mode\}/g, mode)
      .replace(/\{filename_slug\}/g, slug)
      .replace(/\{Profile\}/g, Profile);

    const signalPath = resolve(TEMP_DIR, `signal-${slug}.txt`);

    // Build environment WITHOUT ANTHROPIC_API_KEY to force subscription auth
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;

    const proc: ChildProcess = spawn("claude", [
      "--print",
      "--model", "sonnet",
      "--output-format", "text",
      "--dangerously-skip-permissions",
      "--no-session-persistence",
      "--system-prompt", prompt,
      "Process the source file following the instructions in your system prompt.",
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      env,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr?.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });

    // Timeout handler
    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      resolvePromise({
        success: false,
        filePath: sourceRelative,
        error: `timeout after ${timeoutMs / 1000}s`,
      });
    }, timeoutMs);

    proc.on("close", (code) => {
      clearTimeout(timer);

      // Check signal file first (most reliable)
      if (existsSync(signalPath)) {
        try {
          const signal = readFileSync(signalPath, "utf-8");
          resolvePromise(parseSignal(signal));
          return;
        } catch {
          // Fall through to check temp JSON
        }
      }

      // Check for temp JSON as partial success indicator
      const tempJsonPath = resolve(TEMP_DIR, `review-${slug}.json`);
      if (existsSync(tempJsonPath)) {
        resolvePromise({
          success: true,
          filePath: sourceRelative,
          routedTo: "unknown",
          confidence: "unknown",
          mode,
          error: "signal file missing but temp JSON exists",
        });
        return;
      }

      // Full failure
      const errSummary = stderr.trim().slice(0, 200) || `exit code ${code}`;
      resolvePromise({
        success: false,
        filePath: sourceRelative,
        error: errSummary,
      });
    });
  });
}

// ── Batch Processing ───────────────────────────────────────────────────────

async function processBatch(
  batch: string[],
  batchNum: number,
  promptTemplate: string,
  profile: string,
  mode: string,
  timeoutMs: number
): Promise<SignalResult[]> {
  console.log(`\n--- Batch ${batchNum} (${batch.length} files) ---`);

  const promises = batch.map((filePath) => {
    const slug = slugify(filePath);
    console.log(`  Spawning: ${basename(filePath)}`);
    return spawnFileAgent(promptTemplate, filePath, profile, mode, slug, timeoutMs);
  });

  const results = await Promise.all(promises);

  // Clean up signal files
  for (const filePath of batch) {
    const signalPath = resolve(TEMP_DIR, `signal-${slugify(filePath)}.txt`);
    try { unlinkSync(signalPath); } catch { /* non-fatal */ }
  }

  // Report batch results
  for (const r of results) {
    if (r.success) {
      console.log(`  ✅ ${basename(r.filePath)} → ${r.routedTo} (${r.confidence}, ${r.mode})`);
    } else {
      console.log(`  ❌ ${basename(r.filePath)} → FAILED: ${r.error}`);
    }
  }

  return results;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseCLI();
  const mode = args.light ? "light" : "full";
  let timeoutMs = args.light ? TIMEOUT_LIGHT_MS : TIMEOUT_FULL_MS;
  if (args.timeout) {
    timeoutMs = args.timeout;
    console.log(`⏱️  Timeout override: ${timeoutMs / 1000}s per file`);
  }

  // 1. Validate profile
  const profileDir = resolve(SKILL_DIR, "Profiles", args.profile.charAt(0).toUpperCase() + args.profile.slice(1));
  if (!existsSync(profileDir)) {
    console.error(`ERROR: Profile not found: ${profileDir}`);
    process.exit(2);
  }

  // 2. Validate target (skip for retry mode — target is optional)
  if (!args.retry && !existsSync(args.target)) {
    console.error(`ERROR: Target not found: ${args.target}`);
    process.exit(2);
  }

  // 3. Load prompt template
  if (!existsSync(PROMPT_PATH)) {
    console.error(`ERROR: FileAgent prompt not found: ${PROMPT_PATH}`);
    process.exit(2);
  }
  const promptTemplate = readFileSync(PROMPT_PATH, "utf-8");

  // 4. Voice notification
  notify(`Running the Review workflow in the Analyse skill to analyse source files with the ${args.profile} profile`);
  console.log(`\nRunning the Review workflow in the Analyse skill...`);

  // 5. Build file list (retry mode or normal discovery)
  let files: string[];
  let skippedManifest = 0;
  let skippedFrontmatter = 0;
  const failedListPath = resolve(TEMP_DIR, `failed-${args.profile}.txt`);

  if (args.retry) {
    // Retry mode: load only previously-failed files
    if (!existsSync(failedListPath)) {
      console.log(`\nNo failed file list found for '${args.profile}'. Nothing to retry.`);
      console.log(`(Failed lists are created automatically when files fail during a review run.)`);
      process.exit(0);
    }
    const failedContent = readFileSync(failedListPath, "utf-8").trim();
    files = failedContent.split("\n").filter(f => f && existsSync(f));

    if (files.length === 0) {
      console.log(`\nFailed file list exists but all files are missing or resolved. Cleaning up.`);
      try { unlinkSync(failedListPath); } catch {}
      process.exit(0);
    }

    console.log(`\n🔄 Retry mode: ${files.length} failed files to re-process.`);
  } else {
    // Normal mode: discover files from target
    try {
      files = buildFileList(args.target);
    } catch (e: any) {
      console.error(`ERROR: ${e.message}`);
      process.exit(2);
    }
  }
  const totalFound = files.length;

  // 6. Load manifest and check reconciliation queue
  let manifest = loadManifest();
  const pendingCount = countPendingReconcile(manifest, args.profile);
  if (pendingCount > 20) {
    console.log(`\n⚠️  WARNING: ${pendingCount} files awaiting reconciliation for '${args.profile}'.`);
    console.log(`   Large queues may not reconcile cleanly. Consider running reconcile first.`);
  } else if (pendingCount > 0) {
    console.log(`\n📋 ${pendingCount} files pending reconciliation for '${args.profile}'.`);
  }

  // 7. Filter already-reviewed (unless --force or --retry)
  if (!args.force && !args.retry) {
    files = files.filter((filePath) => {
      const sourceRel = relative(KB_ROOT, filePath);

      // Check manifest
      if (isFileReviewed(manifest, sourceRel, args.profile)) {
        skippedManifest++;
        return false;
      }
      // Also check with _sources/ prefix pattern
      const sourceRelAlt = sourceRel.startsWith("_sources/") ? sourceRel : `_sources/${sourceRel}`;
      if (isFileReviewed(manifest, sourceRelAlt, args.profile)) {
        skippedManifest++;
        return false;
      }

      // Check frontmatter
      try {
        const content = readFileSync(filePath, "utf-8");
        if (hasProfileReview(content, args.profile)) {
          skippedFrontmatter++;
          return false;
        }
      } catch {
        // Can't read file — keep it in list, agent will handle error
      }

      return true;
    });
  }

  // 8. Detect orphaned temp files, exclude those files
  const orphanedTemps = findOrphanedTempFiles();
  const orphanedSlugs = new Set(
    orphanedTemps.map((p) => basename(p).replace(/^review-/, "").replace(/\.json$/, ""))
  );

  let skippedOrphans = 0;
  if (orphanedSlugs.size > 0) {
    files = files.filter((filePath) => {
      if (orphanedSlugs.has(slugify(filePath))) {
        skippedOrphans++;
        return false;
      }
      return true;
    });
    console.log(`\n📁 Found ${orphanedTemps.length} orphaned temp files from a previous run (will merge)`);
  }

  // Clean up orphaned signal files
  const orphanedSignals = findOrphanedSignalFiles();
  for (const sig of orphanedSignals) {
    try { unlinkSync(sig); } catch { /* non-fatal */ }
  }

  // 9. Enforce --max
  const totalToProcess = files.length;
  if (files.length > args.max) {
    files = files.slice(0, args.max);
    console.log(`\n📊 Processing ${args.max} of ${totalToProcess} remaining files. Run again to continue.`);
  }

  // 10. Report plan
  console.log(`\n## Review Plan\n`);
  console.log(`Profile: ${args.profile}`);
  console.log(`Target: ${args.target}`);
  console.log(`Mode: ${mode}`);
  console.log(`Files found: ${totalFound}`);
  console.log(`Already reviewed: ${skippedManifest + skippedFrontmatter} (${skippedManifest} manifest, ${skippedFrontmatter} frontmatter)`);
  console.log(`Orphaned temp files: ${orphanedTemps.length}`);
  console.log(`To process: ${files.length}`);
  console.log(`Session limit: ${args.max}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  if (files.length === 0) {
    console.log(`\nNo files to process. All files already reviewed or no matching files found.`);
    // Still merge any orphaned temps
    if (orphanedTemps.length > 0) {
      await runMerge();
      await runValidate();
    }
    process.exit(0);
  }

  console.log(`\nFiles to process:`);
  for (let i = 0; i < files.length; i++) {
    console.log(`  ${i + 1}. ${basename(files[i])}`);
  }
  console.log(`\nProceeding with review...\n`);

  // Ensure temp directory exists
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR, { recursive: true });
  }

  // 11. Process in batches
  const allResults: SignalResult[] = [];
  const batches = Math.ceil(files.length / BATCH_SIZE);

  for (let b = 0; b < batches; b++) {
    const start = b * BATCH_SIZE;
    const batch = files.slice(start, start + BATCH_SIZE);
    const results = await processBatch(batch, b + 1, promptTemplate, args.profile, mode, timeoutMs);
    allResults.push(...results);

    const completed = allResults.length;
    const succeeded = allResults.filter((r) => r.success).length;
    console.log(`\n  Progress: ${completed}/${files.length} files (${succeeded} succeeded)`);
  }

  // 12. Merge temp files into manifest
  console.log(`\n--- Merging temp files into manifest ---`);
  const mergeOk = await runMerge();

  // 13. Validate merged manifest
  console.log(`\n--- Validating manifest ---`);
  const validateOk = await runValidate();

  // 14. Summary
  const succeeded = allResults.filter((r) => r.success).length;
  const failed = allResults.filter((r) => !r.success).length;
  const remaining = totalToProcess - files.length;

  // Count products from results
  const productCounts: Record<string, number> = {};
  for (const r of allResults) {
    if (r.success && r.routedTo) {
      for (const product of r.routedTo.split(",")) {
        const p = product.trim();
        if (p) productCounts[p] = (productCounts[p] || 0) + 1;
      }
    }
  }

  console.log(`\n## Review Complete\n`);
  console.log(`Profile: ${args.profile}`);
  console.log(`Mode: ${mode}`);
  console.log(`Processed: ${allResults.length} / ${totalFound}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (already reviewed): ${skippedManifest + skippedFrontmatter}`);
  if (remaining > 0) {
    console.log(`Remaining (session limit): ${remaining} — run again to continue`);
  }

  if (Object.keys(productCounts).length > 0) {
    console.log(`\nResults by product:`);
    for (const [product, count] of Object.entries(productCounts).sort()) {
      console.log(`  ${product}: ${count} files`);
    }
  }

  if (failed > 0) {
    console.log(`\nFailed files:`);
    for (const r of allResults.filter((r) => !r.success)) {
      console.log(`  ❌ ${r.filePath}: ${r.error}`);
    }
  }

  // Persist failed file list for --retry
  const failedAbsPaths = allResults
    .filter(r => !r.success)
    .map(r => resolve(KB_ROOT, r.filePath));

  if (failedAbsPaths.length > 0) {
    writeFileSync(failedListPath, failedAbsPaths.join("\n") + "\n", "utf-8");
    console.log(`\n📝 Failed file list saved to: _temp/failed-${args.profile}.txt`);
    console.log(`   Re-run with --retry to process only these files.`);
  } else {
    // Clean up previous failed list on full success
    try { unlinkSync(failedListPath); } catch {}
  }

  if (!mergeOk) {
    console.log(`\n⚠️  Manifest merge had issues — check output above.`);
  }
  if (!validateOk) {
    console.log(`\n⚠️  Manifest validation had issues — check output above.`);
  }

  // 15. Auto-reconcile if --apply
  if (args.apply && succeeded > 0) {
    console.log(`\n--- Auto-reconciling (--apply) ---`);
    const reconcilePath = resolve(SKILL_DIR, "Tools/ReconcileOrchestrator.ts");
    if (existsSync(reconcilePath)) {
      const reconcileProc = spawn("bun", [reconcilePath, args.profile], {
        stdio: "inherit",
      });
      const reconcileCode = await new Promise<number>((res) => {
        reconcileProc.on("close", (code) => res(code ?? 1));
      });
      if (reconcileCode !== 0) {
        console.log(`\n⚠️  Reconciliation exited with code ${reconcileCode}`);
      }
    } else {
      console.log(`\n⚠️  ReconcileOrchestrator.ts not found — skipping reconcile.`);
    }
  } else if (!args.apply && succeeded > 0) {
    console.log(`\nNext: Run reconcile to merge extractions into Product.md files.`);
  }

  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// ── Helper: Run MergeManifest.ts ───────────────────────────────────────────

function runMerge(): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const proc = spawn("bun", [resolve(SKILL_DIR, "Tools/MergeManifest.ts")], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    proc.stdout?.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr?.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.on("close", (code) => {
      console.log(`  ${stdout.trim()}`);
      resolvePromise(code === 0);
    });
  });
}

// ── Helper: Run ValidateManifest.ts ────────────────────────────────────────

function runValidate(): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const proc = spawn("bun", [resolve(SKILL_DIR, "Tools/ValidateManifest.ts"), MANIFEST_PATH], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    proc.stdout?.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr?.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.on("close", (code) => {
      console.log(`  ${stdout.trim()}`);
      resolvePromise(code === 0);
    });
  });
}

// ── Run ────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(2);
});
