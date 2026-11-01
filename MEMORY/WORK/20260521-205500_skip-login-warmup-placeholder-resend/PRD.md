---
task: Skip /login warmup on placeholder RESEND_API_KEY
slug: 20260521-205500_skip-login-warmup-placeholder-resend
effort: advanced
phase: build
progress: 24/26
mode: dispatched
started: 2026-05-21T20:55:00Z
updated: 2026-05-21T21:00:00Z
---

## Context

Bea dispatched by Pippa to file a GitHub issue AND ship the implementation in one PR on McCullonas/fairfolk.

On 2026-05-21 sandcastle run `2026-05-21T14-27-51-513Z` iter-4 was working on issue #42 (community.submitFair), made fix commit `bf47191`, and tried to push. Preflight failed because the warmup request to `/login` returned HTTP 500 (`SyntaxError: Unexpected end of JSON input` from Resend API), causing the `.next` cache to be incompletely warmed. The subsequent CSP test for `/fairs` then hit a cold-compile issue that triggered a CSP violation — the exact pattern that `b876e1d` was designed to prevent but which resurfaces when the warmup itself fails.

Iter-4 emitted BLOCKED correctly per the post-#142 contract, then sandcastle's 600s agent-idle timeout killed the orchestrator. PR #148 was the manual salvage that landed at merge SHA `e216a1e`.

The defensive fix in this dispatch is option (a): in `tests/e2e/global-setup.ts > warmRoute`, skip the `/login` entry when `RESEND_API_KEY` is unset OR matches the `.env.example` placeholder pattern (`replace-me-*`).

Option (b) — stop GET `/login` from hitting Resend at all (Auth.js CSRF endpoint chain on Server Component render) — is OUT OF SCOPE for this PR and will be filed as a follow-up sub-task on the same issue.

### Risks

- Skip pattern too tight: a real key shaped like `replace-me-...` (impossible per Resend `re_*` format) could be skipped — non-issue.
- Skip pattern too loose: matches a legitimate key — mitigated by anchoring to `^replace-me-` prefix only.
- Hides a real `/login` regression on local dev with a real key — out of scope; this only fires on placeholder.
- CI: CI environment has a real `RESEND_API_KEY` injected via secrets; skip predicate evaluates false → no behaviour change.
- Skip too aggressive on undefined: undefined === placeholder semantics are correct — if key is unset, Resend can't be called, /login still 500s, skip still right.

## Criteria

- [x] ISC-1: Issue filed on McCullonas/fairfolk with title matching dispatch spec
- [x] ISC-2: Issue labelled `backlog` and `afk-ready` and `tier:2`
- [x] ISC-3: Issue body includes ralph log path reference
- [x] ISC-4: Issue body includes PR #148 reference and merge SHA e216a1e
- [x] ISC-5: Issue body includes sandcastle run-id 2026-05-21T14-27-51-513Z
- [x] ISC-6: Issue body presents two viable approaches (a) and (b)
- [x] ISC-7: Issue body explicitly recommends approach (a) for this PR
- [x] ISC-8: Issue body lists acceptance criteria for approach (a)
- [x] ISC-9: Issue body files (b) as out-of-scope follow-up sub-task
- [x] ISC-10: Issue body uses only literal placeholder string from .env.example
- [x] ISC-11: Branch `chore/skip-login-warmup-on-placeholder-resend` created off main at e216a1e
- [x] ISC-12: `tests/e2e/global-setup.ts` checks RESEND_API_KEY before warming /login
- [x] ISC-13: Skip condition fires when RESEND_API_KEY is unset
- [x] ISC-14: Skip condition fires when RESEND_API_KEY doesn't start with re_ (catches replace-me-*, sandbox-stub-*, etc)
- [x] ISC-15: Skip emits stderr line containing "skipping /login warmup"
- [x] ISC-16: Skip emits stderr line naming RESEND_API_KEY in the message
- [x] ISC-17: New vitest unit test file created at tests/scripts/resend-placeholder-warmup-skip.test.ts
- [x] ISC-18: Unit test covers unset-key skip branch
- [x] ISC-19: Unit test covers placeholder-key skip branch
- [x] ISC-20: Unit test covers real-key proceeds branch
- [x] ISC-21: Three consecutive cold-cache preflight runs pass on fresh checkout
- [x] ISC-22: PR opened with title matching dispatch spec
- [x] ISC-23: PR body references the filed issue number
- [x] ISC-24: PR body lists three preflight run timings
- [ ] ISC-25: PR passes CodeRabbit review (CR streak target 12/12)
- [ ] ISC-26: PR merged to main with green CI

## Decisions

- Pattern: predicate returns true when key is unset/empty/whitespace OR doesn't start with `re_`. Real Resend keys are `re_<20+alnum>` — predicate's negation is the definitive "is this a real Resend key" check. This catches BOTH `.env.example` placeholder (`replace-me-*`) AND `.sandcastle/run.mts` sandbox stub (`sandbox-stub-*`) AND any future placeholder shape — single source of truth.
- Skip path is per-route inside warmRoute caller (or a new env-gated WARMUP_ROUTES filter), not inside warmRoute itself — keeps warmRoute pure.
- Unit test will not invoke playwright. It will exercise an exported predicate `shouldSkipLoginWarmup(env)` for testability, mirroring the testability shape of preflight-database-url-friction.test.ts.
- Place predicate inline in global-setup.ts, export it for testing. No new file under src/ — keeps fix localised to tests/ tree.

## Verification

(populated during VERIFY phase)
