---
name: Analyse
description: Multi-agent source analysis with pluggable reviewer profiles. USE WHEN /analyse, analyse source, review source, analyse product, analyse directory, reconcile, analyse-status.
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/CORE/USER/SKILLCUSTOMIZATIONS/Analyse/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


## MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Analyse skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Analyse** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# Analyse Skill

Multi-agent source analysis system with pluggable reviewer profiles. Each profile brings its own expert agents and extraction targets. Same source files can be reviewed multiple times by different profiles.

**Key Differentiator from Council:** Analyse is purpose-built for document extraction with structured output. Council is freeform debate. Analyse produces structured extractions mapped to target document templates.

## Workflow Routing

Route to the appropriate TypeScript orchestrator based on the request.

| Trigger | Tool | Description |
|---------|------|-------------|
| `/analyse [profile] [file-or-dir]` | `bun Tools/ReviewOrchestrator.ts <profile> <target>` | Analyse file or directory with named profile |
| `/analyse [profile] [target] --light` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --light` | Round 1 only, ~3x faster |
| `/analyse [profile] [target] --apply` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --apply` | Analyse then reconcile |
| `/analyse [profile] [target] --max N` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --max N` | Limit to N files per session (default 20) |
| `/analyse [profile] [target] --force` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --force` | Re-analyse already-reviewed files |
| `/analyse [profile] [target] --retry` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --retry` | Retry only files that failed in the previous run |
| `/analyse [profile] [target] --timeout N` | `bun Tools/ReviewOrchestrator.ts <profile> <target> --timeout N` | Set per-file timeout to N seconds |
| `/reconcile [profile]` | `bun Tools/ReconcileOrchestrator.ts <profile>` | Merge pending extractions into target docs |
| `/analyse-status [profile]` | Status check (inline) | Show review status for profile |

**Execution:** Run the orchestrator via `Bash` tool. The TypeScript tool handles all logistics deterministically (file discovery, batching, progress tracking, manifest management). LLM judgement is used only for per-file analysis (FileAgent via `claude --print`) and smart deduplication (via Inference.ts).

### Parameter: Profile (Required)

The profile name determines which expert agents and extraction template to use.

| Profile | Path | Status |
|---------|------|--------|
| `product` | `Profiles/Product/` | Implemented |
| `marketing` | `Profiles/Marketing/` | Future |
| `finance` | `Profiles/Finance/` | Future |

### Parameter: --force

By default, Analyse skips files already reviewed for the specified profile. Use `--force` to re-analyse.

### Parameter: --light

Light mode runs Round 1 only (3 parallel agents, no cross-validation or synthesis). ~3x faster. Best for simpler documents like blog posts. Light extractions are marked with `"mode": "light"` in the manifest so reconcile knows the confidence context.

### Parameter: --max N

Maximum files to process per session. Default: 50. The orchestrator processes up to this many files, then stops. Run the same command again to continue — already-reviewed files are automatically skipped.

### Parameter: --retry

Retry only files that failed in the previous run. When a review run has failures, the orchestrator saves a list of failed file paths to `_temp/failed-<profile>.txt`. Running with `--retry` reads this list and processes only those files, skipping normal file discovery and manifest/frontmatter filtering. The failed list is automatically cleaned up when all retried files succeed. Combines with `--light`, `--timeout`, `--max`, and `--apply`.

### Parameter: --timeout N

Override the per-file timeout (in seconds). Default is 300s for full mode, 180s for light mode. Use higher values for large transcripts that need more processing time. Example: `--timeout 600` gives each file 10 minutes.

### Status Check (Inline)

When `/analyse-status [profile]` is triggered, read `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` and report:

```
Analyse Status: [profile]
- X files reviewed, pending reconcile
- Y files reconciled
- Z files not yet reviewed (in _sources/GoogleDrive/)
```

## Profile Structure

Each profile directory contains:

| File | Purpose |
|------|---------|
| `Experts.md` | Agent definitions with personalities and focus areas |
| `Template.md` | Extraction template mapping to target document sections |
| `AnonymizationRules.md` | Profile-specific anonymization rules |

## State Files

| File | Purpose |
|------|---------|
| `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` | Central manifest tracking all reviews |
| `~/github/mccullonas-kb/McCullonas/Orphans.md` | Topics that don't fit existing products |

## Two-Stage Process

**Stage 1: Analyse** (Review.md)
- Each file gets its own independent Task agent context (orchestrator never reads source content)
- Expert agents extract intelligence within file-level agents
- Extractions stored in REVIEW-MANIFEST.json
- Source file frontmatter updated with review status
- Status: `pending_reconcile`

**Stage 2: Reconcile** (Reconcile.md)
- Iterates `pending_reconcile` entries in manifest
- Merges extractions into target documents (e.g., Product.md)
- Updates manifest status to `reconciled`
- Handles orphan topics

**Single-stage:** Use `--apply` to run both stages in sequence.

## Integration

**Works well with:**
- **ProductManager** - Reconcile feeds into Product.md files Pippa maintains
- **Council** - For debating ambiguous routing decisions
- **Research** - For gathering context on unfamiliar topics before analysis

## Files Modified

- `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` - Review tracking
- `~/github/mccullonas-kb/_sources/GoogleDrive/*.{txt,md}` - Source file frontmatter
- `~/github/mccullonas-kb/McCullonas/Projects/*/Product.md` - Target documents (on reconcile)
- `~/github/mccullonas-kb/McCullonas/Orphans.md` - Orphan topics

---

## Output Discipline

After running orchestrators, the orchestrator's stdout IS the complete progress report. Your conversation text must NOT include:
- Full file contents or extraction details pasted inline
- Diffs showing what changed in Product.md files
- Detailed descriptions of reconciliation changes or extraction content

Pass through the orchestrator's summary output and add at most one summary line. Do not elaborate on what the orchestrator already reported. The user can expand individual tool calls if they want detail.

## Architecture Note

The orchestration layer uses TypeScript (`ReviewOrchestrator.ts`, `ReconcileOrchestrator.ts`) for deterministic logistics. The LLM judgement layer uses `claude --print` for per-file analysis (`FileAgent.prompt.txt`) and Inference.ts (Haiku) for smart deduplication during reconciliation. See `Workflows/Review.md` and `Workflows/Reconcile.md` for legacy documentation of the workflow logic.

**Last Updated:** 2026-02-08
