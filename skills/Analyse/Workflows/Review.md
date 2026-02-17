# Review Workflow

> **Legacy:** Replaced by `Tools/ReviewOrchestrator.ts`. This file documents the intended workflow logic and is kept as reference. The TypeScript orchestrator implements this behavior deterministically.

Process source files through independent context windows, with batched parallelism and progress tracking. Accepts a single file or a directory — architecture is identical (a single file is a batch of one).

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Review workflow in the Analyse skill to analyse source files"}' \
  > /dev/null 2>&1 &
```

Running the **Review** workflow in the **Analyse** skill to analyse source files...

## Parameters

- **profile** (required): Profile name (e.g., `product`)
- **target** (required): Path to a single file OR a directory of files
- **--force** (optional): Re-analyse files already reviewed for this profile
- **--apply** (optional): Reconcile all after review completes
- **--light** (optional): Light mode — Round 1 only (3 agents per file, no cross-validation or synthesis)
- **--max N** (optional): Maximum files to process this session (default: 20). Use to control session length.

## Prerequisites

- Target must exist (file or directory)
- Profile must exist at `~/.claude/skills/Analyse/Profiles/{Profile}/`
- Load `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` for skip checking

## Architecture: Independent Context Windows

**CRITICAL: The orchestrator NEVER reads source file content.** Each file gets its own Task agent with a fresh context window. The agent reads the file, runs all rounds, and returns only a one-line summary.

```
THIS CONVERSATION (orchestrator — stays light)
│
├── Batch 1 (up to 3 files in parallel)
│   ├── Task Agent: file-1  ← own context window, reads file, runs 3 rounds
│   ├── Task Agent: file-2  ← own context window
│   └── Task Agent: file-3  ← own context window
│
├── Collect one-line results, report progress
│
├── Batch 2 (next 3 files, or done if single file)
│   └── ...
│
├── Merge all temp JSONs into manifest (ONE operation at end)
│
└── Final summary report
```

**Why this works:**
- Orchestrator only holds: file list + one-line pass/fail per file
- Each file agent accumulates round results but only for ONE file
- Round agents (Finn/Vera/Pippa) are short-lived — spawn, return result, die
- No cross-file context bleed
- Works identically for 1 file or 215 files

## Execution

### Step 1: Build File List

Detect whether the target is a file or directory:

**If target is a single file:**
- File list = `[target]`
- Skip directory discovery

**If target is a directory:**
- Recursively list all files in the target directory and subdirectories
- Include: `.txt`, `.md`, `.pdf`, `.docx` files
- Exclude: Files starting with `.` or `_`
- Exclude: `INDEX.md`, `REVIEW-MANIFEST.json`, and other metadata files
- Sort alphabetically for deterministic ordering

### Step 2: Check Reconciliation Queue

Read `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` and count entries where `status` is `pending_reconcile`.

**If pending count > 0**, warn the user using AskUserQuestion:

```
You have [N] files awaiting reconciliation for the [profile] profile.
Adding more analysed files will grow the reconciliation queue.
Large queues (20+) may not reconcile cleanly in a single pass.

Recommendation: run /reconcile [profile] first to clear the queue.
```

Options:
- "Reconcile first" — abort analyse, advise user to run `/reconcile`
- "Continue anyway" — proceed with analysis (user accepts the risk)

**If pending count is 0**, proceed silently.

### Step 3: Filter Already-Reviewed

Read the manifest (already loaded above) for the skip list.

Unless `--force` is set, check each file:
1. Check manifest for existing review entry for this profile → skip (reason: "manifest skip")
2. Check file's YAML frontmatter for `reviews.{profile}` block → if present, skip (reason: "frontmatter skip")

This dual check catches files reviewed by Analyse (in manifest) AND files written by other systems (e.g. ProductManager/Pippa conversations with `reviews.product` frontmatter).

Track skipped files for reporting, distinguishing "manifest skip" vs "frontmatter skip".

### Step 4: Check for Orphaned Temp Files

Check `~/github/mccullonas-kb/_sources/_temp/` for any `review-*.json` files from a previous interrupted run:
- If found, report them: "Found N orphaned temp files from a previous run"
- These will be merged into the manifest during the final merge step
- Do NOT re-process files that have orphaned temp results (treat them as completed)

### Step 5: Enforce Session Limit

If files to process exceeds `--max` (default 20):
- Take only the first `--max` files
- Report: "Processing {max} of {total} remaining files. Run again to continue."

### Step 6: Report Plan

Before processing, output the review plan:

```markdown
## Review Plan

**Profile:** [profile]
**Target:** [file or directory path]
**Mode:** [full/light]
**Files found:** [total count]
**Already reviewed:** [skip count] (skipping)
**Orphaned temp files:** [count] (will merge)
**To process:** [remaining count]
**Session limit:** [max] files
**Batch size:** 3 files in parallel (or 1 if single file)

Files to process:
1. filename1.txt
2. filename2.txt
3. ...

Proceeding with review...
```

### Step 7: Process Files in Batches of 3

For each batch of up to 3 files (a single file = one batch of 1):

1. **Launch BACKGROUND Task agents**, one per file. Each Task agent:
   - **subagent_type:** `general-purpose`
   - **model:** `sonnet` (cost-efficient)
   - **run_in_background:** `true` ← CRITICAL: prevents agent output from entering orchestrator context
   - Receives the full FileAgent.md prompt (from `Workflows/FileAgent.md`) with variables substituted:
     - `{file_path}` → full path to source file
     - `{profile}` → profile name
     - `{mode}` → "full" or "light"
     - `{filename_slug}` → filename for temp output
     - `{Profile}` → capitalized profile name for path references
   - Agent reads the source file in its own context, runs all rounds internally, writes temp JSON + updates frontmatter + writes signal file
   - The Task tool returns only a task_id and output_file path (tiny — ~100 bytes)

2. **Poll for signal files.** After launching the batch, wait for all agents to complete by checking for their signal files. For each file in the batch, the expected signal file is:
   `~/github/mccullonas-kb/_sources/_temp/signal-{filename_slug}.txt`

   **Polling method:** Use a single Bash command to check all signal files at once:
   ```bash
   # Wait up to 5 minutes, checking every 15 seconds
   for i in $(seq 1 20); do
     count=$(ls ~/github/mccullonas-kb/_sources/_temp/signal-*.txt 2>/dev/null | wc -l)
     if [ "$count" -ge {batch_size} ]; then break; fi
     sleep 15
   done
   echo "Signal files found: $(ls ~/github/mccullonas-kb/_sources/_temp/signal-*.txt 2>/dev/null | wc -l)"
   ```

   Then read EACH signal file individually using the Read tool. Each contains a single line:
   - `DONE|{file_path}|{routed_to}|{confidence}|{mode}` — success
   - `FAIL|{file_path}|{reason}` — failure

   **CRITICAL: Do NOT use TaskOutput to retrieve agent results.** TaskOutput returns the full agent transcript into your context — exactly the bloat we are avoiding. Signal files are the ONLY way to collect results.

3. **Clean up signal files** after reading them:
   ```bash
   rm ~/github/mccullonas-kb/_sources/_temp/signal-*.txt 2>/dev/null
   ```

4. **Output batch progress:**
   ```markdown
   --- Batch [N] complete ---
   ✅ filename1.txt → HomeLab (High, full)
   ✅ filename2.txt → HomeAutomation, PantryTracking (Medium, light)
   ❌ filename3.txt → FAILED: File unreadable
   Progress: [completed]/[total] files
   ```

5. **Continue with next batch.** If a file fails, log and continue (don't abort).

**Why background + signal files:** The Task tool normally returns the agent's full response into the orchestrator's context. Even a "one-line" response includes preamble, and across 20+ files this accumulates to exceed context limits. Background agents + signal files ensure the orchestrator only ever reads ~100 bytes per file, regardless of how verbose the agents are internally.

### Step 8: Merge Temp Files into Manifest

After ALL files complete (or on session limit), run the **external merge tool**:

```bash
bun ~/.claude/skills/Analyse/Tools/MergeManifest.ts
```

**CRITICAL: Do NOT read temp JSON files or the manifest into context.** The merge tool handles everything externally — reads temp files, appends to manifest, writes the result, deletes processed temps. The orchestrator only sees the summary line:

- `MERGED|{count_merged}|{total_entries}|ok` — success
- `MERGED|{count_merged}|{total_entries}|{N} failed` — partial failure (check output)

This prevents extraction data from bloating the orchestrator's context window.

### Step 8b: Validate Merged Manifest

After writing the manifest, run the deterministic validator:

```bash
bun ~/.claude/skills/Analyse/Tools/ValidateManifest.ts ~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json
```

- If output is `PASS` → proceed to summary
- If output is `FAIL` → report which entries failed and their errors in the summary. These entries had invalid data that slipped through the file-level validators (should not happen, but this is a safety net).

### Step 9: Summary

After all files processed and manifest merged:

```markdown
## Review Complete

**Profile:** [profile]
**Mode:** [full/light]
**Processed:** [count] / [total]
**Succeeded:** [count]
**Failed:** [count]
**Skipped (already reviewed):** [count]
**Remaining (session limit):** [count] — run again to continue

### Results by Product

- **HomeLab:** [count] files routed here
- **HomeAutomation:** [count] files routed here
- **Infrastructure:** [count] files routed here
- [etc.]

### Orphans Found: [count]
[List of orphan topics with suggested actions]

### Failed Files
[List of failed files with reasons, if any]

**Next:** Run `/reconcile [profile]` to merge extractions into Product.md files.
```

### Step 10: Auto-Reconcile (if --apply)

If `--apply` flag was set, execute `Workflows/Reconcile.md` for the profile.

## Error Handling

- **File-level agent fails:** Orchestrator logs failure, continues with next batch. Failed files can be retried on next run (they won't have manifest entries).
- **Batch interrupted:** Temp files persist. Next run detects orphaned temps, merges them, and skips those files.
- **Temp file exists but manifest not updated:** Handled by Step 3 — orphaned temps are detected and merged.
- **Manifest write fails:** Output all temp file paths so they can be manually merged.

## Timing

**Full mode (default):**
- Per file: ~35-65 seconds (3 rounds x 3 agents)
- Per batch of 3: ~35-65 seconds (parallel)
- 20 files: ~7 batches x ~50s = ~6 minutes
- 215 files: 11 sessions x ~6 minutes = ~66 minutes total

**Light mode (--light):**
- Per file: ~15-25 seconds (1 round x 3 agents)
- Per batch of 3: ~15-25 seconds (parallel)
- 20 files: ~7 batches x ~20s = ~2.5 minutes
- 157 blog posts: 8 sessions x ~2.5 minutes = ~20 minutes total

## Configuration Reference

| Setting | Default | Override |
|---------|---------|----------|
| Batch size | 3 files | Not configurable (conservative for stability) |
| Session limit | 20 files | `--max N` (MUST NOT exceed 30 — context safety) |
| Mode | full (3 rounds) | `--light` (1 round) |
| Temp directory | `~/github/mccullonas-kb/_sources/_temp/` | Not configurable |
| Agent model | sonnet | Not configurable |

## Done

Review complete. All successful extractions stored in manifest. Ready for reconciliation.
