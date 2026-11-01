---
task: Land four open PRs then refire sandcastle
slug: 20260525-000000_land-prs-refire-sandcastle
effort: advanced
phase: complete
progress: 9/26
mode: autonomous
started: 2026-05-25T08:47:49+00:00
updated: 2026-05-25T08:58:00+00:00
---

## Context

Autonomous overnight babysit of four open PRs on McCullonas/fairfolk, all with auto-merge queued but stuck on CodeRabbit latency. After landing (or 8-round timeout), re-fire sandcastle against fresh main and investigate why it exited at iter-3.

PRs in scope:
- #201 feat-sentinel-phase-1 — APPROVED, autoMerge=Y, mergeStateStatus=UNKNOWN
- #206 RALPH iter-1 cleanup — REVIEW_REQUIRED, autoMerge=Y
- #207 sandcastle classic PAT fix — REVIEW_REQUIRED, autoMerge=Y
- #209 RALPH protectedProcedure userId — REVIEW_REQUIRED, autoMerge=Y, mergeStateStatus=BLOCKED

### Risks

- CR may be silent on a PR — nudge ONCE then leave
- #209 BLOCKED could be merge conflict / behind main → rebase required
- Sandcastle exited cleanly at iter-3 → label filter may exclude remaining issues
- Worktree at feat-sentinel-phase-1 must not be touched until #201 merges

## Criteria

Round 0 — discover & nudge:
- [ ] ISC-1: Round 0 status table emitted for all four PRs
- [ ] ISC-2: #206 nudged with @coderabbitai review if REVIEW_REQUIRED and CR inactive
- [ ] ISC-3: #207 nudged with @coderabbitai review if REVIEW_REQUIRED and CR inactive
- [ ] ISC-4: #209 nudged with @coderabbitai review if REVIEW_REQUIRED and CR inactive
- [ ] ISC-5: #209 mergeStateStatus diagnosed (BLOCKED reason identified)
- [ ] ISC-6: No duplicate nudges issued (one per PR per dispatch)

Polling rounds 1-8:
- [ ] ISC-7: Each round runs as ONE bash call (no chained sleeps)
- [ ] ISC-8: Each round reports state for all still-open PRs
- [ ] ISC-9: Loop exits on terminal state (all MERGED) OR round 8 cap
- [ ] ISC-10: No --admin used
- [ ] ISC-11: No --no-verify used
- [ ] ISC-12: No force-push to main
- [ ] ISC-13: feat-sentinel-phase-1 worktree untouched while #201 open

Refire (post-merge or post-timeout):
- [ ] ISC-14: Main checkout fast-forwarded from origin/main
- [ ] ISC-15: Main checkout git status clean before refire
- [ ] ISC-16: core.bare confirmed false
- [ ] ISC-17: Worktree list confirms only expected worktrees
- [ ] ISC-18: Sandcastle launched via nohup with PID captured
- [ ] ISC-19: Sandcastle process confirmed alive 5s after launch
- [ ] ISC-20: Log path /tmp/sandcastle-night-2026-05-24.log exists

Eligible-issue investigation:
- [ ] ISC-21: Open-issue list with labels enumerated (top 30)
- [ ] ISC-22: Ralph label filter logic identified from .sandcastle source
- [ ] ISC-23: Count of issues matching Ralph labels reported

Report:
- [ ] ISC-24: Lead line in required format (Merged/Open/Sandcastle/Eligible)
- [ ] ISC-25: Anomalies section follows lead line
- [ ] ISC-26: Total report under 300 words

## Decisions

## Verification
