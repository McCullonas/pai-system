/**
 * files.ts — File discovery and utility functions for the Analyse skill.
 */

import { readdirSync, statSync, existsSync } from "fs";
import { resolve, join, extname, basename } from "path";
import { TEMP_DIR } from "./manifest";

// ── Constants ──────────────────────────────────────────────────────────────

const VALID_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".docx"]);
const EXCLUDE_FILENAMES = new Set(["INDEX.md", "REVIEW-MANIFEST.json"]);

// ── Functions ──────────────────────────────────────────────────────────────

/**
 * Build a list of files to process.
 * If target is a file, returns [target].
 * If target is a directory, recursively finds valid files.
 */
export function buildFileList(target: string): string[] {
  const absTarget = resolve(target);
  const stat = statSync(absTarget);

  if (stat.isFile()) {
    return [absTarget];
  }

  if (stat.isDirectory()) {
    return findFilesRecursive(absTarget).sort();
  }

  throw new Error(`Target is neither file nor directory: ${absTarget}`);
}

function findFilesRecursive(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip dotfiles and _-prefixed entries
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...findFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      // Skip excluded filenames
      if (EXCLUDE_FILENAMES.has(entry.name)) continue;
      // Check extension
      const ext = extname(entry.name).toLowerCase();
      if (VALID_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Convert a file path to a slug for temp file naming.
 * Filename without extension, special chars → hyphens.
 */
export function slugify(filePath: string): string {
  const name = basename(filePath, extname(filePath));
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Find orphaned temp review JSON files from interrupted runs.
 */
export function findOrphanedTempFiles(): string[] {
  if (!existsSync(TEMP_DIR)) return [];
  return readdirSync(TEMP_DIR)
    .filter((f) => f.startsWith("review-") && f.endsWith(".json"))
    .map((f) => join(TEMP_DIR, f));
}

/**
 * Find orphaned signal files from interrupted runs.
 */
export function findOrphanedSignalFiles(): string[] {
  if (!existsSync(TEMP_DIR)) return [];
  return readdirSync(TEMP_DIR)
    .filter((f) => f.startsWith("signal-") && f.endsWith(".txt"))
    .map((f) => join(TEMP_DIR, f));
}
