#!/usr/bin/env bun
/**
 * ValidateManifest.ts — Validate the merged REVIEW-MANIFEST.json (array of review entries).
 *
 * Usage:
 *   bun ~/.claude/skills/Analyse/Tools/ValidateManifest.ts [path-to-manifest]
 *
 * Defaults to ~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json if no path given.
 *
 * Exit codes:
 *   0 = PASS (all entries valid)
 *   1 = FAIL (one or more entries invalid)
 *   2 = ERROR (file not found, parse error)
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { homedir } from "os";

const SCHEMA_PATH = resolve(dirname(import.meta.path), "../Schemas/review-entry.schema.json");
const DEFAULT_MANIFEST = resolve(homedir(), "github/mccullonas-kb/_sources/REVIEW-MANIFEST.json");

function main(): void {
  const filePath = process.argv[2] || DEFAULT_MANIFEST;
  const absPath = resolve(filePath);

  if (!existsSync(absPath)) {
    console.error(`ERROR: Manifest not found: ${absPath}`);
    process.exit(2);
  }

  if (!existsSync(SCHEMA_PATH)) {
    console.error(`ERROR: Schema not found: ${SCHEMA_PATH}`);
    process.exit(2);
  }

  let data: unknown;
  try {
    const raw = readFileSync(absPath, "utf-8");
    data = JSON.parse(raw);
  } catch (e: any) {
    console.error(`ERROR: Failed to parse JSON: ${e.message}`);
    process.exit(2);
  }

  if (!Array.isArray(data)) {
    console.log("FAIL");
    console.log("  - (root): manifest must be an array of review entries, got " + typeof data);
    process.exit(1);
  }

  if (data.length === 0) {
    console.log("PASS (empty manifest — 0 entries)");
    process.exit(0);
  }

  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  let passCount = 0;
  let failCount = 0;
  const failures: { index: number; source: string; errors: string[] }[] = [];

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const source = typeof entry === "object" && entry !== null && "source_file" in entry
      ? (entry as any).source_file
      : `(entry ${i})`;

    const valid = validate(entry);

    if (valid) {
      const e = entry as any;

      // Extra check: transcript length for full mode
      if (e.mode === "full" && e.transcript.length < 200) {
        failCount++;
        failures.push({
          index: i,
          source,
          errors: [`transcript too short for full mode: ${e.transcript.length} chars (minimum 200)`],
        });
        continue;
      }

      // Cross-field validation: type constrains status and mode
      const crossFieldErrors: string[] = [];

      if (e.type === "meeting") {
        if (e.mode === "conversation") {
          // Agent conversation (e.g. ProductManager session) — interactive statuses
          if (!["active", "parked", "written_up"].includes(e.status)) {
            crossFieldErrors.push(`meeting+conversation requires status: active|parked|written_up, got '${e.status}'`);
          }
        } else if (e.mode === "transcription") {
          // Imported meeting transcript processed by Analyse — reconciliation statuses
          if (e.status !== "pending_reconcile" && e.status !== "reconciled") {
            crossFieldErrors.push(`meeting+transcription requires status: pending_reconcile|reconciled, got '${e.status}'`);
          }
        } else {
          crossFieldErrors.push(`meeting type requires mode: conversation|transcription, got '${e.mode}'`);
        }
      }

      if (e.type === "document" || e.type === "web_scrape") {
        if (e.status !== "pending_reconcile" && e.status !== "reconciled") {
          crossFieldErrors.push(`${e.type} type requires status: pending_reconcile|reconciled, got '${e.status}'`);
        }
        if (!["full", "light"].includes(e.mode)) {
          crossFieldErrors.push(`${e.type} type requires mode: full|light, got '${e.mode}'`);
        }
      }

      if (crossFieldErrors.length > 0) {
        failCount++;
        failures.push({ index: i, source, errors: crossFieldErrors });
        continue;
      }

      passCount++;
    } else {
      failCount++;
      const errs = (validate.errors || []).map((err) => {
        const path = err.instancePath || "(root)";
        const msg = err.message || "unknown error";
        return `${path}: ${msg}`;
      });
      failures.push({ index: i, source, errors: errs });
    }
  }

  if (failCount === 0) {
    console.log(`PASS (${passCount}/${data.length} entries valid)`);
    process.exit(0);
  }

  console.log(`FAIL (${failCount}/${data.length} entries invalid)`);
  console.log("");
  for (const f of failures) {
    console.log(`  Entry ${f.index}: ${f.source}`);
    for (const e of f.errors) {
      console.log(`    - ${e}`);
    }
  }
  process.exit(1);
}

main();
