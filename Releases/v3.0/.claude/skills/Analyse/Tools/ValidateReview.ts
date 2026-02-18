#!/usr/bin/env bun
/**
 * ValidateReview.ts — Validate a single review temp JSON file against the review-entry schema.
 *
 * Usage:
 *   bun ~/.claude/skills/Analyse/Tools/ValidateReview.ts <path-to-review-json>
 *
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (validation errors)
 *   2 = ERROR (file not found, parse error, etc.)
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const SCHEMA_PATH = resolve(dirname(import.meta.path), "../Schemas/review-entry.schema.json");

function main(): void {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("ERROR: No file path provided.");
    console.error("Usage: bun ValidateReview.ts <path-to-review-json>");
    process.exit(2);
  }

  const absPath = resolve(filePath);

  if (!existsSync(absPath)) {
    console.error(`ERROR: File not found: ${absPath}`);
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

  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    const entry = data as any;

    // Extra check: transcript length for full mode
    if (entry.mode === "full" && entry.transcript.length < 200) {
      console.log("FAIL");
      console.log(`  - transcript too short for full mode: ${entry.transcript.length} chars (minimum 200)`);
      process.exit(1);
    }

    // Cross-field validation: type constrains status and mode
    const crossFieldErrors: string[] = [];

    if (entry.type === "meeting") {
      if (entry.mode === "conversation") {
        // Agent conversation (e.g. ProductManager session) — interactive statuses
        if (!["active", "parked", "written_up"].includes(entry.status)) {
          crossFieldErrors.push(`meeting+conversation requires status: active|parked|written_up, got '${entry.status}'`);
        }
      } else if (entry.mode === "transcription") {
        // Imported meeting transcript processed by Analyse — reconciliation statuses
        if (entry.status !== "pending_reconcile" && entry.status !== "reconciled") {
          crossFieldErrors.push(`meeting+transcription requires status: pending_reconcile|reconciled, got '${entry.status}'`);
        }
      } else {
        crossFieldErrors.push(`meeting type requires mode: conversation|transcription, got '${entry.mode}'`);
      }
    }

    if (entry.type === "document" || entry.type === "web_scrape") {
      if (entry.status !== "pending_reconcile" && entry.status !== "reconciled") {
        crossFieldErrors.push(`${entry.type} type requires status: pending_reconcile|reconciled, got '${entry.status}'`);
      }
      if (!["full", "light"].includes(entry.mode)) {
        crossFieldErrors.push(`${entry.type} type requires mode: full|light, got '${entry.mode}'`);
      }
    }

    if (crossFieldErrors.length > 0) {
      console.log("FAIL");
      for (const e of crossFieldErrors) {
        console.log(`  - (cross-field): ${e}`);
      }
      process.exit(1);
    }

    console.log("PASS");
    process.exit(0);
  }

  console.log("FAIL");
  for (const err of validate.errors || []) {
    const path = err.instancePath || "(root)";
    const msg = err.message || "unknown error";
    const extra = err.params
      ? Object.entries(err.params)
          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
          .join(", ")
      : "";
    console.log(`  - ${path}: ${msg}${extra ? ` [${extra}]` : ""}`);
  }
  process.exit(1);
}

main();
