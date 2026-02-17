#!/usr/bin/env bun
/**
 * ValidateFrontmatter.ts — Extract YAML frontmatter from a source file and validate
 * the reviews.{profile} structure against the frontmatter schema.
 *
 * Usage:
 *   bun ~/.claude/skills/Analyse/Tools/ValidateFrontmatter.ts <source-file> <profile>
 *
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (validation errors)
 *   2 = ERROR (file not found, no frontmatter, parse error)
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

const SCHEMA_PATH = resolve(dirname(import.meta.path), "../Schemas/frontmatter.schema.json");

function extractFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function main(): void {
  const filePath = process.argv[2];
  const profile = process.argv[3];

  if (!filePath || !profile) {
    console.error("ERROR: Missing arguments.");
    console.error("Usage: bun ValidateFrontmatter.ts <source-file> <profile>");
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

  const content = readFileSync(absPath, "utf-8");
  const fmRaw = extractFrontmatter(content);

  if (!fmRaw) {
    console.error("ERROR: No YAML frontmatter found (expected --- delimiters).");
    process.exit(2);
  }

  let fmData: unknown;
  try {
    fmData = parseYaml(fmRaw);
  } catch (e: any) {
    console.error(`ERROR: Failed to parse YAML frontmatter: ${e.message}`);
    process.exit(2);
  }

  if (typeof fmData !== "object" || fmData === null) {
    console.error("ERROR: Frontmatter is not an object.");
    process.exit(2);
  }

  const fm = fmData as Record<string, any>;

  // Check that reviews key exists
  if (!fm.reviews) {
    console.log("FAIL");
    console.log("  - (root): missing required property 'reviews'");
    console.log("  - Frontmatter uses flat structure instead of nested reviews.{profile}");
    process.exit(1);
  }

  // Check that the specific profile exists under reviews
  if (!fm.reviews[profile]) {
    console.log("FAIL");
    console.log(`  - reviews: missing profile key '${profile}'`);
    process.exit(1);
  }

  // Check for flat-structure drift (common failure: reviewed, reviewed_at, etc. at root)
  const driftKeys = ["reviewed", "reviewed_at", "review_status", "profile", "source", "temp_file", "extraction_file", "review_json"];
  const foundDrift = driftKeys.filter((k) => k in fm);
  if (foundDrift.length > 0) {
    console.log("FAIL");
    console.log(`  - (root): found flat-structure drift keys that should be nested under reviews.${profile}: ${foundDrift.join(", ")}`);
    process.exit(1);
  }

  // Validate against schema
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(fmData);

  if (valid) {
    // Cross-field validation: type constrains status and mode
    const review = fm.reviews[profile];
    const crossFieldErrors: string[] = [];

    if (review.type === "meeting") {
      if (review.mode === "conversation") {
        // Agent conversation (e.g. ProductManager session) — interactive statuses
        if (!["active", "parked", "written_up"].includes(review.status)) {
          crossFieldErrors.push(`meeting+conversation requires status: active|parked|written_up, got '${review.status}'`);
        }
      } else if (review.mode === "transcription") {
        // Imported meeting transcript processed by Analyse — reconciliation statuses
        if (review.status !== "pending_reconcile" && review.status !== "reconciled") {
          crossFieldErrors.push(`meeting+transcription requires status: pending_reconcile|reconciled, got '${review.status}'`);
        }
      } else {
        crossFieldErrors.push(`meeting type requires mode: conversation|transcription, got '${review.mode}'`);
      }
    }

    if (review.type === "document" || review.type === "web_scrape") {
      if (review.status !== "pending_reconcile" && review.status !== "reconciled") {
        crossFieldErrors.push(`${review.type} type requires status: pending_reconcile|reconciled, got '${review.status}'`);
      }
      if (!["full", "light"].includes(review.mode)) {
        crossFieldErrors.push(`${review.type} type requires mode: full|light, got '${review.mode}'`);
      }
    }

    if (crossFieldErrors.length > 0) {
      console.log("FAIL");
      for (const e of crossFieldErrors) {
        console.log(`  - reviews.${profile}: ${e}`);
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
