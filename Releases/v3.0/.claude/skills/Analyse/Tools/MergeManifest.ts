#!/usr/bin/env bun
/**
 * MergeManifest.ts — Merge temp review JSON files into REVIEW-MANIFEST.json.
 *
 * Reads all review-*.json files from _temp/, appends to existing manifest,
 * writes the merged result, and deletes processed temp files.
 *
 * Runs OUTSIDE the orchestrator's context window to prevent context bloat.
 *
 * Usage:
 *   bun ~/.claude/skills/Analyse/Tools/MergeManifest.ts [manifest-path] [temp-dir]
 *
 * Defaults:
 *   manifest: ~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json
 *   temp-dir: ~/github/mccullonas-kb/_sources/_temp/
 *
 * Exit codes:
 *   0 = SUCCESS (outputs summary line)
 *   1 = FAIL (merge error)
 *   2 = ERROR (filesystem error)
 */

import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { homedir } from "os";

const DEFAULT_MANIFEST = resolve(homedir(), "github/mccullonas-kb/_sources/REVIEW-MANIFEST.json");
const DEFAULT_TEMP_DIR = resolve(homedir(), "github/mccullonas-kb/_sources/_temp");

function main(): void {
  const manifestPath = resolve(process.argv[2] || DEFAULT_MANIFEST);
  const tempDir = resolve(process.argv[3] || DEFAULT_TEMP_DIR);

  // Load existing manifest (or start with empty array)
  let manifest: unknown[] = [];
  if (existsSync(manifestPath)) {
    try {
      const raw = readFileSync(manifestPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.error("FAIL: Existing manifest is not an array");
        process.exit(1);
      }
      manifest = parsed;
    } catch (e: any) {
      console.error(`ERROR: Failed to parse manifest: ${e.message}`);
      process.exit(2);
    }
  }

  // Find temp review files
  if (!existsSync(tempDir)) {
    console.log("MERGED|0|0|no temp directory");
    process.exit(0);
  }

  const tempFiles = readdirSync(tempDir)
    .filter((f) => f.startsWith("review-") && f.endsWith(".json"))
    .sort();

  if (tempFiles.length === 0) {
    console.log(`MERGED|0|${manifest.length}|no temp files to merge`);
    process.exit(0);
  }

  // Read and append each temp file
  const merged: string[] = [];
  const failed: string[] = [];

  for (const filename of tempFiles) {
    const filepath = join(tempDir, filename);
    try {
      const raw = readFileSync(filepath, "utf-8");
      const entry = JSON.parse(raw);
      manifest.push(entry);
      merged.push(filename);
    } catch (e: any) {
      failed.push(`${filename}: ${e.message}`);
    }
  }

  // Write merged manifest
  try {
    // Ensure parent directory exists
    const parentDir = manifestPath.substring(0, manifestPath.lastIndexOf("/"));
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  } catch (e: any) {
    console.error(`ERROR: Failed to write manifest: ${e.message}`);
    process.exit(2);
  }

  // Delete successfully merged temp files
  for (const filename of merged) {
    try {
      unlinkSync(join(tempDir, filename));
    } catch {
      // Non-fatal — temp file stays, will be skipped on next merge
    }
  }

  // Output summary
  if (failed.length > 0) {
    console.log(`MERGED|${merged.length}|${manifest.length}|${failed.length} failed`);
    for (const f of failed) {
      console.log(`  FAIL: ${f}`);
    }
    process.exit(1);
  }

  console.log(`MERGED|${merged.length}|${manifest.length}|ok`);
  process.exit(0);
}

main();
