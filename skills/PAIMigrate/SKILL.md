---
name: PAIMigrate
description: Migrate PAI to a new version. Diffs current install against vanilla baseline, identifies all customisations, builds merged installation with new version + our data. USE WHEN migrate, version upgrade, upgrade PAI, new PAI version, run migration, pai migrate.
context: fork
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/PAIMigrate/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## MANDATORY Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the PAIMigrate skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **PAIMigrate** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# PAIMigrate Skill

**Primary Purpose:** Safely migrate a running PAI installation to a new version while preserving all customisations, personal data, and learned context.

**How it differs from PAIUpgrade:** PAIUpgrade monitors the ecosystem for new techniques and features. PAIMigrate performs the actual version swap — it's the mechanism that applies a new PAI release.

```
PAIUpgrade: "There's a new PAI version available with these features"
PAIMigrate: "Let me build the merged installation and prepare the swap"
```

---

## Key Constraint

Marvin cannot modify `~/.claude` while running from it. The migration builds a merged installation in a staging directory. The user performs a 2-command swap and restarts.

---

## Prerequisites

- PAI source repo checked out at `~/github/Personal_AI_Infrastructure`
- The repo contains `Releases/vX.Y/.claude` for both current and target versions
- The source repo is up to date (`git pull` before migration)

---

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Migrate** | "migrate to vX", "upgrade PAI", "run migration", "pai migrate" | `Workflows/Migrate.md` |
| **DryRun** | "dry run", "what would change", "preview migration", "diff only" | `Workflows/DryRun.md` |

**Default workflow:** If user says "migrate" without specifics, run **Migrate**.

---

## Core Concepts

### The Three-Way Comparison

Every migration uses three directories:

| Directory | What | Example |
|-----------|------|---------|
| **Baseline** | Vanilla install of our CURRENT version | `Releases/v3.0/.claude` |
| **Current** | Our running installation with all customisations | `~/.claude` |
| **Target** | Vanilla install of the NEW version | `Releases/v3.2/.claude` |

**Step 1:** `Current - Baseline = Changeset` (everything we customised)
**Step 2:** `Target + Changeset = Merged` (new version with our stuff)

### File Categories

Every file in the changeset falls into one of these categories:

| Category | Description | Action |
|----------|-------------|--------|
| **USER** | Personal data in `skills/PAI/USER/` | Always port |
| **MEMORY** | Learnings, work sessions, state | Always port |
| **CustomSkill** | Skills we created (not in stock) | Always port |
| **Config** | Our config files (.codespellrc, .pre-commit-config.yaml, etc.) | Always port |
| **Credentials** | .env, .credentials.json, settings.local.json | Always port |
| **Infrastructure** | .git, .github, mcp-servers, Observability | Always port |
| **RuntimeState** | projects/, commands/, plugins/, plans/, file-history/ | Always port |
| **RuntimeJunk** | debug/, paste-cache/, telemetry/, shell-snapshots/, cache/ | Never port |
| **SystemModified** | Stock files we modified (hooks, tools) | Use target version |

### The Adversarial Check

After building the merged installation, every file in the changeset is cross-referenced:

- Every **addition** must appear in the merged installation OR be in the "not porting" list with a reason
- Every **modification** must either be ported (USER files) or superseded by target version (SYSTEM files)
- Every **deletion** must be acknowledged

If any file is unaccounted for, the migration STOPS and reports the gap.

---

## Settings.json Merge Strategy

The settings.json merge is the most delicate operation. The strategy:

1. Start with the TARGET version's settings.json as base
2. Overlay our identity values (`daidentity.name`, `principal.name`, etc.)
3. Migrate schema changes (e.g. flat `voiceId` → nested `voices.main.voiceId`)
4. Preserve our MCP server configurations
5. Use target's hook registrations (hooks are SYSTEM, not USER)
6. Keep our counts and runtime state values

The merge must handle schema evolution — keys that moved, renamed, or restructured between versions.

---

## Output

The skill produces:

1. **Migration Report** — saved to `~/github/mccullonas-kb/Marvin/Research/PAI-vX-MIGRATION-REPORT.md`
   - Complete changeset inventory (additions, modifications, deletions)
   - Category assignment for every file
   - Adversarial cross-reference results
   - Settings.json merge decisions

2. **Merged Installation** — at `~/github/claude-v{VERSION}-merged/`
   - Ready to swap in

3. **Swap Commands** — presented to the user:
   ```bash
   mv ~/.claude ~/.claude-vX-backup && mv ~/github/claude-v{VERSION}-merged ~/.claude
   # Restart Claude Code
   ```

4. **Rollback Commands** — in case of issues:
   ```bash
   mv ~/.claude ~/github/claude-v{VERSION}-broken && mv ~/.claude-vX-backup ~/.claude
   # Restart Claude Code
   ```

---

## Tool Reference

| Tool | Purpose |
|------|---------|
| `Tools/DiffBaseline.ts` | Diff current install against vanilla baseline, output categorised changeset |
| `Tools/BuildMerged.ts` | Build merged installation from target + changeset |

---

## Workflows

- **Migrate.md** — Full migration: diff, build, verify, report
- **DryRun.md** — Diff-only: show what would change without building anything
