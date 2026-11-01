---
task: ship issue 142 flake-retry plus stranded SHA
slug: 20260521-132247_issue-142-flake-retry-and-sha
effort: advanced
phase: execute
progress: 7/28
mode: autonomous
started: 2026-05-21T13:22:47Z
updated: 2026-05-21T13:25:00Z
---

## Context

Issue #142 (McCullonas/fairfolk) asks for two narrow changes to `.sandcastle/review-prompt.md`:
1. A **flake-retry budget** for the §3c pre-push hook (signature-matched, bounded, no bypass).
2. **Name the stranded fix SHA** in the abort-comment template plus give the operator a one-line salvage recipe.

The issue is `shape-required`. Shaping IS this dispatch: allowlist lives in `.sandcastle/preflight-flake-signatures.txt` (one signature per line, `#` for comments); retry budget = 2 retries (3 pushes total); warm-cache between retries = `npm run build` (and `npm run pretest:e2e` on fairfolk where it exists).

Must mirror to `marvin-app-starter` in a parallel PR with cross-links.

### Risks
- The §3c flake-retry text must not loosen the "no bypass" principle — every retry runs full preflight.
- Marvin-app-starter has older "Hook-bypass — STRICTLY FORBIDDEN" heading + slightly different body; my edit must not collide with the dual-encoding banner or §5a guidance.
- `FIX_SHA` is captured at line 208 AFTER the §3c push — the abort template fires when push FAILS, so I need to capture SHA *before* the push attempt (where it sits as `git rev-parse --short HEAD`).
- Concurrent Bea on #141 is touching the same repo — worktree isolation mandatory (used).
- CR streak: 7/7 currently. Don't bail. Use `resolveReviewThread` for sticky CHANGES_REQUESTED.

### Plan
1. Write `.sandcastle/preflight-flake-signatures.txt` in both repos with the two initial signatures + maintenance contract header.
2. Add new §3c subsection (`### 3c.i Preflight flake-retry budget`) in both review-prompts: signature-matched retry, warm-cache, hard-bail conditions, exactly mirroring §2b rate-limit precedent shape.
3. Update the §3c push block so `FIX_SHA` is captured *before* the push attempt and used in the abort comment if push fails after exhausting retries.
4. Update the existing preflight-failure abort comment to include `Local fix commit: <SHA>` + cherry-pick recipe.
5. Open both PRs, cross-link, drive to MERGED on respective mains.

## Criteria

Allowlist file (fairfolk):
- [ ] ISC-1: `.sandcastle/preflight-flake-signatures.txt` created in fairfolk worktree
- [ ] ISC-2: File header contains 1-sentence maintenance contract
- [ ] ISC-3: File contains CSP cold-compile pattern signature
- [ ] ISC-4: File contains generic Playwright timeout pattern signature
- [ ] ISC-5: File supports `#` comments and one-signature-per-line format

Allowlist file (marvin-app-starter):
- [ ] ISC-6: `.sandcastle/preflight-flake-signatures.txt` created in MAS worktree
- [ ] ISC-7: MAS file mirrors fairfolk header + signatures verbatim

Review-prompt changes (fairfolk):
- [ ] ISC-8: New `### 3c.i Preflight flake-retry budget` subsection added under §3c
- [ ] ISC-9: Subsection documents 2-retry budget (3 pushes total)
- [ ] ISC-10: Subsection documents signature-match allowlist reading from txt file
- [ ] ISC-11: Subsection documents warm-cache step between retries
- [ ] ISC-12: Subsection documents hard-bail conditions (non-flake-sig fail, same-sig N+1, different test fails)
- [ ] ISC-13: Subsection explicitly states "every retry runs full preflight — not a bypass"
- [ ] ISC-14: Abort comment template in §"Preflight non-negotiable" includes `Local fix commit: <SHA>` line
- [ ] ISC-15: Abort comment template includes cherry-pick salvage recipe

Review-prompt changes (marvin-app-starter):
- [ ] ISC-16: Same §3c.i subsection added in MAS review-prompt
- [ ] ISC-17: Same abort comment update applied in MAS review-prompt

PR mechanics (fairfolk):
- [ ] ISC-18: Fairfolk PR opened on branch `chore/review-prompt-flake-retry-and-sha` with required title
- [ ] ISC-19: Fairfolk PR body cross-links to MAS PR + issue #142
- [ ] ISC-20: Fairfolk PR CR loop reaches APPROVED (no early bail)
- [ ] ISC-21: Fairfolk PR merged on main with no `--no-verify` / `--admin` / force-push-to-main

PR mechanics (marvin-app-starter):
- [ ] ISC-22: MAS PR opened on same branch name with mirrored title
- [ ] ISC-23: MAS PR body cross-links to fairfolk PR
- [ ] ISC-24: MAS PR CR loop reaches APPROVED
- [ ] ISC-25: MAS PR merged on main with no bypasses

Closeout:
- [ ] ISC-26: Issue #142 closed with comment citing both merge SHAs
- [ ] ISC-27: GitGuardian green on both PRs at merge time
- [ ] ISC-28: Both worktrees cleaned up post-merge

### Anti-criteria
- [ ] ISC-A1: No `--no-verify` used at any point
- [ ] ISC-A2: No `--admin` used on either merge
- [ ] ISC-A3: No force-push to main (only `--force-with-lease` to feature branch)
- [ ] ISC-A4: No early CR bail (wait for APPROVED)

## Decisions

D1. **Allowlist storage:** `.sandcastle/preflight-flake-signatures.txt` — plain text, one signature per line, `#` comments. Greppable, auditable, no parser dependency. (Issue body recommended txt or YAML; txt is simpler.)

D2. **Retry budget = 2 retries (3 pushes total).** Matches §2b rate-limit precedent shape, gives one warm-cache retry + one final retry, then hard-bail.

D3. **Warm-cache command:** `npm run build` on both; additionally `npm run pretest:e2e` on fairfolk where it exists (vr:fetch). Built into the retry block as a try-each pattern.

D4. **Signature format:** ERE-compatible regex strings, matched via `grep -E -f` against captured `npm run preflight` stderr. Each signature is one regex line.

D5. **`FIX_SHA` capture timing:** Move `FIX_SHA=$(git rev-parse --short HEAD)` to *before* the §3c push attempt, so it's already in scope if the push fails and we need to name it in the abort comment.

D6. **Maintenance contract (file header):** "Add entries only after a flake has been confirmed reproducible AND the substrate fix is non-trivial."

D7. **Branch name:** `chore/review-prompt-flake-retry-and-sha` in both repos. PR title `chore(sandcastle): preflight flake-retry budget + name stranded SHA in abort comment (#142)` (MAS uses same suffix `(#142)` for cross-link clarity).

## Verification

(Populated during EXECUTE/VERIFY.)
