/**
 * manifest.ts — Shared manifest types and I/O for the Analyse skill.
 *
 * Pattern: readFileSync / JSON.parse / writeFileSync (same as MergeManifest.ts)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { homedir } from "os";

// ── Constants ──────────────────────────────────────────────────────────────

export const KB_ROOT = resolve(homedir(), "github/mccullonas-kb");
export const MANIFEST_PATH = resolve(KB_ROOT, "_sources/REVIEW-MANIFEST.json");
export const TEMP_DIR = resolve(KB_ROOT, "_sources/_temp");
export const SKILL_DIR = resolve(homedir(), ".claude/skills/Analyse");

// ── Types ──────────────────────────────────────────────────────────────────

export interface ExtractionSection {
  agent: "Finn" | "Vera" | "Pippa";
  content: string;
  confidence: "high" | "medium" | "low";
}

export interface ExtractionSectionClients extends ExtractionSection {
  anonymized: true;
}

export interface Extractions {
  overview: ExtractionSection;
  status: ExtractionSection;
  target_users: ExtractionSection;
  value_proposition: ExtractionSection;
  differentiators: ExtractionSection;
  features: ExtractionSection;
  limitations: ExtractionSection;
  dependencies: ExtractionSection;
  commercial_model: ExtractionSection;
  use_cases: ExtractionSection;
  clients: ExtractionSectionClients;
  references: ExtractionSection;
}

export interface OrphanEntry {
  topic: string;
  description: string;
  suggested_action: "create_product" | "expand_existing" | "needs_investigation";
  notes: string;
}

export interface AnonymizationEntry {
  original: string;
  replacement: string;
  type: "client" | "financial" | "pricing" | "individual";
}

export interface ReviewEntry {
  source_file: string;
  profile: string;
  type: "meeting" | "document" | "web_scrape";
  import_date: string;
  participants: string[];
  mode: "full" | "light" | "conversation" | "transcription";
  reviewed_at: string;
  status: "active" | "parked" | "written_up" | "pending_reconcile" | "reconciled";
  reconciled_at: string | null;
  routed_to: string[];
  confidence: "high" | "medium" | "low";
  extractions: Extractions;
  orphans: OrphanEntry[];
  anonymizations_applied: AnonymizationEntry[];
  transcript: string;
}

// ── Functions ──────────────────────────────────────────────────────────────

export function loadManifest(): ReviewEntry[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  const raw = readFileSync(MANIFEST_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Manifest is not an array: ${MANIFEST_PATH}`);
  }
  return parsed as ReviewEntry[];
}

export function saveManifest(manifest: ReviewEntry[]): void {
  const parentDir = MANIFEST_PATH.substring(0, MANIFEST_PATH.lastIndexOf("/"));
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

export function filterPendingReconcile(manifest: ReviewEntry[], profile: string): ReviewEntry[] {
  return manifest.filter(
    (e) => e.profile === profile && e.status === "pending_reconcile"
  );
}

export function countPendingReconcile(manifest: ReviewEntry[], profile: string): number {
  return filterPendingReconcile(manifest, profile).length;
}

export function isFileReviewed(manifest: ReviewEntry[], sourceFile: string, profile: string): boolean {
  return manifest.some(
    (e) => e.source_file === sourceFile && e.profile === profile
  );
}
