# TODO: Add Failed File Retry Mechanism

**Date:** 2026-02-08
**Context:** First production run of ReviewOrchestrator.ts against ~/github/mccullonas-kb/_sources/Meetings

## Problem

When files timeout or fail during a review run, there's no way to specifically target them for retry. The orchestrator logs failures to stdout but doesn't persist them.

### Current skip logic (ReviewOrchestrator.ts step 7):
- Checks manifest for existing entry → skip
- Checks frontmatter for `reviews.{profile}` → skip
- Failed files have neither, so they're NOT skipped on re-run

### But the gap is:
- A plain re-run picks up failed files AND all other unprocessed files
- With `--max N`, it processes the first N alphabetically — which may not include the failed files
- `--force` disables ALL skip logic, so `--max N` grabs from the full file list — wrong
- No way to say "just retry the ones that failed last time"

## Evidence

First run: 16/20 succeeded, 4 timed out (all 300s timeout on large transcripts):
- Elasticsearch-BulkUpload-2025-02-28.txt
- Marshmallow-Credit-2025-09-26.txt
- Operational-Mgmt-2025-10-06.txt
- SJ-TB-AM-Planning-2025-11-25.md

## Proposed Solutions

### Option A: `--retry` flag
- On failure, write failed file paths to `_temp/failed-{profile}.txt`
- `--retry` flag reads this file and processes only those files
- Combine with `--light` to retry with faster/shorter processing
- Clean up the failed list after successful retry

### Option B: Smarter `--force` with `--max`
- When using `--force --max N`, prioritize files that don't have manifest entries
- This naturally targets failed files first

### Option C: Accept file paths from stdin
- `cat failed-files.txt | bun ReviewOrchestrator.ts product --stdin`
- Most flexible but requires user to manage the list

### Option D (simplest): Just pass specific files
- The orchestrator already accepts single file paths
- User can run: `bun ReviewOrchestrator.ts product path/to/failed-file.txt`
- Works today, no code changes needed, but requires user to copy-paste paths

## Recommendation

Option A (`--retry` flag with persisted failed list) is cleanest. Option D works as a manual workaround today.

## Also Consider

- Increase timeout for large files (currently 5 min full, 3 min light)
- Add `--timeout N` flag for user control
- The 4 failed files may need `--light` mode regardless of timeout since they're large transcripts that consume too much agent context in full mode
