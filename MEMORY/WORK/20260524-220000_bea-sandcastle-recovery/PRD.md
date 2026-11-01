---
task: Push iter-1 PR, fix sandcastle auth, refire
slug: 20260524-220000_bea-sandcastle-recovery
effort: advanced
phase: complete
progress: 24/24
mode: interactive
started: 2026-05-24T22:00:00Z
updated: 2026-05-24T23:25:00Z
---

## Context

Sandcastle iter-1 picked up issue #203 (cleanup work for self-hosted runner workspace + tmp residue), implemented on branch `ralph/2026-05-24T21-52-03-683Z/1` at commit `814b82d`. Push was blocked because the container's `gh` auth uses an OAuth `gho_*` token without `workflow` scope (issue #205). The host has a classic PAT that can push workflow files. Branch already exists on host's local refs.

Three tasks: A) push branch + open PR + queue auto-merge; B) fix sandcastle container auth to use classic PAT (close #205), time-box 20 min, BLOCKED-break otherwise; C) refire sandcastle from main, report PID.

### Risks
- Token push form may need `x-access-token` user prefix
- Container auth investigation could expand unexpectedly — must respect 20-min cap
- Worktree state must remain clean; `feat-sentinel-phase-1` worktree must not be touched

## Criteria

Task A — Push branch + PR:
- [x] ISC-1: Local branch `ralph/2026-05-24T21-52-03-683Z/1` exists at commit 814b82d
- [x] ISC-2: Host PAT retrieved via `gh auth token`
- [x] ISC-3: Branch pushed to origin successfully
- [x] ISC-4: PR opened against base `main`
- [x] ISC-5: PR title matches commit 814b82d's subject
- [x] ISC-6: PR body references issue #203 and #205
- [x] ISC-7: PR auto-merge queued via `gh pr merge --merge --delete-branch --auto`
- [x] ISC-8: No polling for merge — proceed to Task B immediately

Task B — Sandcastle container auth fix:
- [x] ISC-9: Identify where container `gh` auth is configured (.sandcastle/.env via EnvResolver)
- [x] ISC-10: Host `gh auth status` inspected to confirm classic PAT presence
- [x] ISC-11: Fix implementation: runtime scope check in run.mts + env.example update
- [x] ISC-12: Branch `fix-substrate-sandcastle-pat` created from main
- [x] ISC-13: Fix committed with message closing #205
- [x] ISC-14: Branch pushed to origin
- [x] ISC-15: PR opened with title `fix(substrate): sandcastle container uses classic PAT for workflow-file pushes (closes #205)`
- [x] ISC-16: Auto-merge queued (PR #207)
- [x] ISC-17: Task B completed within 20 minutes

Task C — Refire sandcastle:
- [x] ISC-18: Working tree on main, fast-forwarded to origin
- [x] ISC-19: `git status -sb` shows clean state
- [x] ISC-20: `git config --get core.bare` returns `false`
- [x] ISC-21: `git worktree list` shows only main + `feat-sentinel-phase-1`
- [x] ISC-22: Sandcastle launched via `nohup npm run sandcastle`
- [x] ISC-23: Sandcastle process verified alive via `pgrep`
- [x] ISC-24: PID reported (2936368)

## Decisions

## Verification
