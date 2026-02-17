# Migrate Workflow

**Trigger:** "migrate to vX", "upgrade PAI", "run migration"

---

## Inputs

The user specifies the target version. If not specified, check the PAI source repo for the latest release.

```
User: "migrate to v3.2"     → target = v3.2
User: "upgrade PAI"         → target = latest in Releases/
User: "migrate"             → target = latest in Releases/
```

---

## Pre-Flight Checks

Before starting, verify:

1. **PAI source repo exists** at `~/github/Personal_AI_Infrastructure`
2. **Source repo is up to date** — run `git -C ~/github/Personal_AI_Infrastructure pull`
3. **Current version identified** — read `pai.version` from `~/.claude/settings.json`
4. **Baseline exists** — `Releases/v{CURRENT}/.claude` directory present
5. **Target exists** — `Releases/v{TARGET}/.claude` directory present
6. **Target is newer than current** — warn if same or older
7. **Staging directory clear** — `~/github/claude-v{TARGET}-merged` does not exist (or ask to overwrite)
8. **Working tree clean** — `git -C ~/.claude status` shows no uncommitted changes (warn if dirty)

If any check fails, report the issue and stop. Do NOT proceed with a partial migration.

---

## Step 1 — Identify the Changeset

### 1a. Generate file lists

```bash
BASELINE="$HOME/github/Personal_AI_Infrastructure/Releases/v{CURRENT}/.claude"
CURRENT="$HOME/.claude"
TARGET="$HOME/github/Personal_AI_Infrastructure/Releases/v{TARGET}/.claude"

# Baseline files (stock install of current version)
cd "$BASELINE" && find . -type f | sort > /tmp/pai-migrate-baseline.txt

# Our files (excluding pure runtime noise)
cd "$CURRENT" && find . -type f \
  -not -path './.git/*' \
  -not -path './MEMORY/*' \
  -not -path './.cache/*' \
  -not -path './.debug/*' \
  -not -path './debug/*' \
  -not -path './paste-cache/*' \
  -not -path './telemetry/*' \
  -not -path './shell-snapshots/*' \
  -not -path './cache/*' \
  -not -path './mcp-servers/*/node_modules/*' \
  -not -path './Observability/*/node_modules/*' \
  | sort > /tmp/pai-migrate-current.txt

# Target files (stock install of new version)
cd "$TARGET" && find . -type f | sort > /tmp/pai-migrate-target.txt
```

### 1b. Compute changeset

**Additions** (files only in ours, not in baseline):
```bash
comm -13 /tmp/pai-migrate-baseline.txt /tmp/pai-migrate-current.txt > /tmp/pai-migrate-additions.txt
```

**Deletions** (files in baseline but not in ours):
```bash
comm -23 /tmp/pai-migrate-baseline.txt /tmp/pai-migrate-current.txt > /tmp/pai-migrate-deletions.txt
```

**Common files** (in both — check which are modified):
```bash
comm -12 /tmp/pai-migrate-baseline.txt /tmp/pai-migrate-current.txt | while read f; do
  if ! diff -q "$BASELINE/$f" "$CURRENT/$f" >/dev/null 2>&1; then
    echo "$f"
  fi
done > /tmp/pai-migrate-modifications.txt
```

### 1c. Categorise every file

For each file in additions + modifications, assign a category:

| Path Pattern | Category |
|---|---|
| `skills/PAI/USER/*` | USER |
| `MEMORY/*` | MEMORY |
| `skills/{NAME}/*` where NAME not in target's skills/ | CustomSkill |
| `.codespellrc`, `.markdownlint.yaml`, `.pre-commit-config.yaml`, `.yamllint.yaml` | Config |
| `.env`, `.credentials.json`, `.claude/*` | Credentials |
| `.git/*`, `.github/*`, `mcp-servers/*`, `Observability/*` | Infrastructure |
| `projects/*`, `commands/*`, `plugins/*`, `plans/*`, `file-history/*`, `tasks/*`, `todos/*` | RuntimeState |
| `history.jsonl`, `stats-cache.json` | RuntimeState |
| `debug/*`, `paste-cache/*`, `telemetry/*`, `shell-snapshots/*`, `cache/*` | RuntimeJunk |
| `hooks/*`, `lib/*`, `agents/*`, `skills/PAI/SKILL.md`, `skills/PAI/Components/*`, `skills/PAI/Tools/*`, `skills/PAI/SYSTEM/*` | SystemModified |
| `INSTALL.ts`, `statusline-*.sh`, `VoiceServer/*` (if in target) | SystemModified |
| Anything else in target's skills/ that we also have | SystemModified |

Report the categorisation as a table.

---

## Step 2 — Build the Merged Installation

### 2a. Start with clean target

```bash
MERGED="$HOME/github/claude-v{TARGET}-merged"
cp -r "$TARGET" "$MERGED"
```

### 2b. Port each category

Execute in this order (later steps may overwrite earlier ones intentionally):

**Infrastructure (git, CI):**
```bash
cp -a "$CURRENT/.git" "$MERGED/.git"
cp -a "$CURRENT/.github" "$MERGED/.github" 2>/dev/null
```

**USER personal data:**
```bash
rm -rf "$MERGED/skills/PAI/USER"
cp -a "$CURRENT/skills/PAI/USER" "$MERGED/skills/PAI/USER"
```

**MEMORY:**
```bash
rm -rf "$MERGED/MEMORY"
cp -a "$CURRENT/MEMORY" "$MERGED/MEMORY"
```

**Custom skills** (iterate over all skills categorised as CustomSkill):
```bash
for skill in {LIST_OF_CUSTOM_SKILLS}; do
  cp -a "$CURRENT/skills/$skill" "$MERGED/skills/$skill"
done
```

**Runtime state:**
```bash
cp -a "$CURRENT/projects" "$MERGED/projects"
cp -a "$CURRENT/mcp-servers" "$MERGED/mcp-servers"
cp -a "$CURRENT/Observability" "$MERGED/Observability"
cp -a "$CURRENT/commands" "$MERGED/commands" 2>/dev/null
cp -a "$CURRENT/plugins" "$MERGED/plugins" 2>/dev/null
cp -a "$CURRENT/plans" "$MERGED/plans" 2>/dev/null
cp -a "$CURRENT/file-history" "$MERGED/file-history" 2>/dev/null
cp -a "$CURRENT/todos" "$MERGED/todos" 2>/dev/null
cp -a "$CURRENT/tasks" "$MERGED/tasks" 2>/dev/null
cp -a "$CURRENT/history.jsonl" "$MERGED/history.jsonl" 2>/dev/null
cp -a "$CURRENT/stats-cache.json" "$MERGED/stats-cache.json" 2>/dev/null
```

**Credentials:**
```bash
cp -a "$CURRENT/.env" "$MERGED/.env" 2>/dev/null
cp -a "$CURRENT/.credentials.json" "$MERGED/.credentials.json" 2>/dev/null
cp -a "$CURRENT/.claude" "$MERGED/.claude" 2>/dev/null
```

**Config files:**
```bash
for cfg in .codespellrc .markdownlint.yaml .pre-commit-config.yaml .yamllint.yaml; do
  cp "$CURRENT/$cfg" "$MERGED/$cfg" 2>/dev/null
done
```

**CLAUDE.md:**
```bash
cp "$CURRENT/CLAUDE.md" "$MERGED/CLAUDE.md"
```

**.gitignore merge:**
Take target's .gitignore as base. Add any entries from ours that target doesn't have.

### 2c. Merge settings.json

This is the most delicate step. Read both files and build a merged version:

1. **Base:** Target's settings.json (gets all new schema, hooks, permissions)
2. **Overlay identity values** from current:
   - `daidentity.name`, `daidentity.fullName`, `daidentity.displayName`
   - `daidentity.color`, `daidentity.startupCatchphrase`
   - `principal.name`, `principal.timezone`
   - `env.PAI_DIR`, `env.PROJECTS_DIR`
   - `techStack.*`
3. **Migrate voice config** — map current voice settings to target schema
4. **Preserve MCP server configs** from current
5. **Preserve counts** from current (sessions, ratings, etc.)
6. **Use target's hooks section** wholesale (hooks are SYSTEM)
7. **Use target's permissions section** as base, add any custom permissions from current

Write the merged settings.json to `$MERGED/settings.json`.

---

## Step 3 — Adversarial Verification

This is the safety net. Every customisation must be accounted for.

### 3a. Cross-reference all additions

For every file in `/tmp/pai-migrate-additions.txt` that isn't RuntimeJunk:
- Verify it exists in `$MERGED`
- If not, flag as **GAP**

### 3b. Cross-reference all modifications

For every file in `/tmp/pai-migrate-modifications.txt`:
- If category is USER/CustomSkill/Config/Credentials: verify our version is in `$MERGED`
- If category is SystemModified: verify target's version is in `$MERGED`
- If unaccounted: flag as **GAP**

### 3c. Verify key counts

| Check | Method |
|-------|--------|
| USER/ file count matches | `find` both and compare |
| MEMORY/ size matches | `du -s` both and compare |
| Custom skills all present | List each, verify exists |
| settings.json valid JSON | `jq .` |
| settings.json has our identity | `jq .daidentity.name` |
| .git intact | `git -C $MERGED log --oneline -1` |
| PROJECTS symlink intact | `readlink` if applicable |
| Commands all present | Count matches |

### 3d. Report gaps

If ANY gaps found: **STOP** and report them. Do not present swap commands until all gaps are resolved.

---

## Step 4 — Generate Report

Save migration report to `~/github/mccullonas-kb/Marvin/Research/PAI-v{TARGET}-MIGRATION-REPORT.md`:

```markdown
# PAI Migration Report: v{CURRENT} -> v{TARGET}
**Date:** {timestamp}
**Status:** READY / GAPS FOUND

## Changeset Summary
| Category | Additions | Modifications | Action |
|----------|-----------|---------------|--------|
| USER | X files | Y files | Ported |
| MEMORY | X files | 0 | Ported |
| CustomSkill | X files (N skills) | 0 | Ported |
| Config | X files | 0 | Ported |
| Credentials | X files | 0 | Ported |
| Infrastructure | X files | 0 | Ported |
| RuntimeState | X files | 0 | Ported |
| RuntimeJunk | X files | 0 | Skipped |
| SystemModified | 0 | Z files | Target version used |

## Custom Skills Ported
[List each with file count]

## Settings.json Merge Decisions
[Key-by-key decisions]

## Adversarial Verification
[All checks with PASS/FAIL]

## New in v{TARGET} (Not in v{CURRENT})
[List new hooks, skills, agents, features]

## Swap Commands
[mv commands]

## Rollback Commands
[mv commands]
```

---

## Step 5 — Present to User

Present:
1. Summary of what was done
2. Any issues or decisions that need input
3. The swap commands
4. The rollback commands

**Wait for the user to perform the swap.** Do not attempt to modify `~/.claude`.
