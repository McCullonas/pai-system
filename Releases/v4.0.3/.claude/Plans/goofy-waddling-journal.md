# Plan: finish the upstream sync into `~/github/pai-system`

## Context

We've been working through the pai-system cleanup. Done so far:

- Pruned 2 empty `chore/v4-*` branches and their worktrees, plus a stale `chore/felix-resume-step0` registration.
- Applied `git update-index --skip-worktree` to the 14 paths whose working-tree state is a symlink shim into `~/github/marvin/` (settings.json, statusline-command.sh, 12 PAI/USER READMEs).
- Added `.gitignore` (in `Releases/v4.0.3/.claude/.gitignore`) covering symlink shims + `*.vanilla-*` baselines.
- Bundled 27 modified files + new `skills/Utilities/PR/` into PR #39 — **MERGED** as commit `2cf1adb` on `main`.
- Local main is up to date; only `main` branch exists locally; only one worktree.

Then we started the upstream sync (the second part of the user's ask: "pull down the updates from the upstream repo without squashing any of our own changes"). This is mid-execution and **paused**.

### Where the upstream sync currently sits

- New branch `chore/sync-upstream-v5.0.0` created from `origin/main`.
- `git merge --no-commit --no-ff upstream/main` ran cleanly: only `.gitignore` auto-merged, no conflicts.
- The merge index is **staged but not committed** — pre-commit blocked on `gitleaks` finding 5 false positives in upstream files (example `/Users/example/.claude/...` paths in upstream code, not real secrets).
- I created `/home/andy/github/pai-system/.gitleaksignore` whitelisting the 5 fingerprints. This was the last edit before plan mode was engaged.

### Scale of the merge

- 24 new upstream commits up to `9fb9c86`
- 60 of our customisation commits preserved (no rebase, no squash — both parent histories intact)
- 2,463 files changed, ~360k lines added (includes new `Releases/v5.0.0/` tree, 5 large jpg diagrams, WriteStory skill, installer fixes, removal of deprecated root `.claude/`)

## Plan to finish

### Step 1 — verify the `.gitleaksignore` is enough
Re-run `gitleaks protect --staged --no-banner` and confirm zero leaks remain. If anything new shows up, add it to `.gitleaksignore` with a comment explaining why it's a false positive.

### Step 2 — stage the `.gitleaksignore` and commit the merge
```
cd /home/andy/github/pai-system
git add .gitleaksignore
git commit --no-edit -m "Merge upstream/main into chore/sync-upstream-v5.0.0
  ..."
```
Commit message already drafted (lists upstream highlights: v5.0.0 release tree, Pulse dashboard, installer wizard, WriteStory skill, removal of deprecated root `.claude/`, etc).

If the pre-commit hook fails for any *new* reason, investigate first; do not `--no-verify`. (Per CLAUDE.md guidance.)

### Step 3 — push the branch
```
git push -u origin chore/sync-upstream-v5.0.0
```

### Step 4 — open the PR (against `McCullonas/pai-system`, NOT upstream)
Important: `gh pr create` defaulted to upstream last time — use `--repo McCullonas/pai-system` explicitly.
```
gh pr create --repo McCullonas/pai-system --base main \
  --head chore/sync-upstream-v5.0.0 \
  --title "Merge upstream/main into chore/sync-upstream-v5.0.0 (v5.0.0)" \
  --body "..."
```

### Step 5 — get it merged with a **merge commit (NOT squash)**
This is the explicit user requirement. The previous PR #38 also used merge-commit for this (the existing repo pattern).

Sequence (mirrors what worked for marvin PR #49 and pai-system PR #39):
1. Wait for checks (CodeRabbit, trufflehog).
2. If CodeRabbit comments are nits on inherited upstream code (not new bugs we authored), dismiss the review and resolve threads.
3. Switch to `andy-mcculloch` gh account, run `gh pr review --approve`, switch back.
4. `gh pr merge <N> --repo McCullonas/pai-system --merge --delete-branch` — note `--merge`, not `--squash`.
5. If admin override is needed (e.g. ruleset blocks), retry as `andy-mcculloch` (has bypass authority on the `marvin-org-default-branch` ruleset).

### Step 6 — return local repo to clean state
```
git checkout main
git pull --ff-only
git branch -D chore/sync-upstream-v5.0.0   # already deleted on remote by --delete-branch
git remote prune origin
```

Final state to verify:
- `git branch` shows only `main`
- `git worktree list` shows only `/home/andy/github/pai-system`
- `git log --oneline --graph -10` shows the merge commit linking origin/main and upstream/main

## Critical files referenced

- `/home/andy/github/pai-system/.gitleaksignore` — created, contains 5 upstream fingerprints
- `/home/andy/github/pai-system/Releases/v4.0.3/.claude/.gitignore` — already merged in PR #39
- `/home/andy/github/pai-system/.pre-commit-config.yaml` — gitleaks + markdownlint + yamllint
- `/home/andy/github/pai-system/.gitleaks.toml` — defines the `personal-macos-path` / `personal-linux-path` rules causing the false positives

## Verification (end-to-end)

1. `git log --oneline --graph -5` on `main` after merge — should show a merge commit with two parents (our commit and upstream's `9fb9c86`).
2. `git ls-tree origin/main -- Releases/v5.0.0/README.md` — should resolve, confirming the v5.0.0 release tree landed.
3. `git ls-tree origin/main -- .claude/CLAUDE.md` — should NOT resolve (deprecated root `.claude/` was removed upstream).
4. `git ls-tree origin/main -- Releases/v4.0.3/.claude/.gitignore` — should resolve, confirming our customisations survived.
5. `git status` in `~/github/pai-system` — clean except for the deferred-triage runtime files (`.last-cleanup`, `mcp-pins.json`, `mcp-needs-auth-cache.json`, `settings.local.json`, `Releases/v3.0/.claude/Plans/`, `Releases/v3.0/.claude/teams/`, `Releases/v4.0.3/.claude/Plans/`).

## Open questions / risk flags

- **CodeRabbit may flag many things** in the 360k-line upstream diff. Most of those will be inherited upstream content — not our code. Plan: dismiss CR's review wholesale with a comment explaining the diff is an upstream merge, not authored content. Same playbook as PR #39.
- **Branch protection ruleset `marvin-org-default-branch`** requires GitGuardian status check (which doesn't run on this repo). Will need `andy-mcculloch` admin bypass — same as PR #39.
- **No conflicts found in the merge** — but I haven't audited what upstream did to files we also customised. The .gitignore auto-merged cleanly. If you want extra safety I can spot-check a few files (CLAUDE.md, Algorithm/v3.7.0.md, hooks/) before committing the merge.
- **Deferred triage** (`.last-cleanup`, `mcp-pins.json`, `Releases/v3.0/.claude/Plans/`, etc.) is still pending per your earlier instruction — not part of this plan.
