---
task: CSP nonce middleware unblocks Client Component hydration
slug: 20260519-121000_csp-nonce-middleware
effort: standard
phase: execute
progress: 0/24
mode: interactive
started: 2026-05-19T12:10:08+00:00
updated: 2026-05-19T12:14:30+00:00
---

## Context

GitHub issue #98 [bug, tier:0]. V0 shipped a deliberate placeholder CSP in `next.config.ts:78`:
`script-src 'self' 'nonce-PLACEHOLDER'`. The literal `PLACEHOLDER` is unmatchable, which was safe
while no Client Component needed hydration. PR #97 landed `/fairs` with `<FairFilterIsland>` — the
first Client Component — and React never hydrates because Next.js's inline bootstrap scripts have
no matching nonce. The behavioural Playwright e2e in `tests/e2e/fair-filter-island.e2e.test.ts`
(lines 60-73, TODO(#98)) is blocked by this.

V0.1 fix: per-request nonce in middleware, threaded to the root layout via `next/headers`.

**Repo state**: Next.js 15.5.15, App Router (`src/app/`), `src/middleware.ts` exists and currently
matches only `/api/auth/signin/email` (rate-limit). CSP currently lives in `next.config.ts`
`async headers()`. Layout at `src/app/layout.tsx` is server-side. PR #97 left the TODO marker.

**Scope boundary**: only `script-src` changes (placeholder → real nonce). All other CSP directives
preserved verbatim, including the `style-src 'self' 'unsafe-inline'` Tailwind compromise documented
in next.config.ts:67-70.

### Risks

- Middleware on Edge runtime: `crypto.randomUUID()` is available; `Buffer` is also available in
  Edge runtime as of Next.js 13+. Confirm before commit.
- Existing middleware rate-limits only `/api/auth/signin/email`. Broadening the matcher to cover
  navigation/RSC routes mustn't accidentally rate-limit GETs or break the existing matcher logic.
  Resolution: keep both responsibilities in one middleware, with the rate-limit check gated on
  method+path as it already is.
- Two sources of CSP truth: must remove CSP from `next.config.ts` headers() once middleware owns
  it. Leave the other security headers (HSTS, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy, Permissions-Policy) in next.config.ts — they're per-request invariant.
- Service worker (`/sw.js`) is served from `/_next/...` / public — middleware matcher must skip it.
- `style-src 'unsafe-inline'` stays per next.config.ts:67-70 Tailwind comment. Do NOT add a
  style nonce (would force Tailwind into a documented-broken state).
- The `Buffer.from(crypto.randomUUID()).toString("base64")` form encodes the literal UUID string
  (with hyphens), not the random bytes. That's ~128 bits of entropy in a 36-char string → base64
  of 36 ascii chars. Sufficient for CSP nonce purposes (>=128 bits per OWASP). Don't second-guess.

### Plan

Single PR, 4 file changes + 2 test files:
1. `src/middleware.ts` — add nonce gen + CSP rewrite branch for non-rate-limited paths.
2. `next.config.ts` — strip CSP from headers() list (middleware owns it now). Keep other headers.
3. `src/app/layout.tsx` — read `x-nonce` from `headers()`, pass to inline scripts if any.
   (Currently no inline scripts, no `next/script` usage in root layout. The nonce read still
   matters because it forces dynamic rendering of the layout shell, which is correct — Next.js
   needs every nav request to flow through middleware. Document why even unused reads matter.)
4. `tests/middleware/csp-nonce.test.ts` — unit test on middleware exports.
5. `tests/e2e/fair-filter-island.e2e.test.ts` — enable the TODO(#98) behavioural test.

## Criteria

- [ ] ISC-1: middleware generates per-request nonce via crypto.getRandomValues(16 bytes) base64-encoded (128 bits)
- [ ] ISC-2: middleware sets x-nonce request header for downstream RSC reads
- [ ] ISC-3: middleware sets Content-Security-Policy response header with nonce-${nonce}
- [ ] ISC-4: CSP script-src directive contains 'nonce-' + actual nonce value (no PLACEHOLDER)
- [ ] ISC-5: CSP preserves all V0 directives (default-src, style-src, img-src, font-src, connect-src, frame-ancestors, form-action, base-uri, upgrade-insecure-requests)
- [ ] ISC-6: CSP keeps style-src 'unsafe-inline' (Tailwind v4 compromise — DO NOT remove)
- [ ] ISC-7: two requests produce two distinct nonces (entropy + per-request property)
- [ ] ISC-8: CSP header removed from next.config.ts headers() list (single source of truth)
- [ ] ISC-9: Other security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) remain in next.config.ts
- [ ] ISC-10: middleware matcher skips _next/static, _next/image, favicon.ico, sw.js, manifest.webmanifest
- [ ] ISC-11: existing rate-limit logic for POST /api/auth/signin/email still fires
- [ ] ISC-12: root layout reads nonce via headers() so downstream <Script> tags can pick it up
- [ ] ISC-13: unit test for nonce generation produces base64 with >=22 chars (128-bit base64 floor)
- [ ] ISC-14: unit test confirms two middleware invocations yield different nonces
- [ ] ISC-15: unit test confirms CSP response header contains the same nonce as x-nonce request header
- [ ] ISC-16: e2e behavioural test for /fairs filter passes — selectOption updates ?category=&region=&sort=
- [ ] ISC-17: npm run typecheck passes
- [ ] ISC-18: npm run lint passes
- [ ] ISC-19: npm run test passes (vitest)
- [ ] ISC-20: PR created with --base main and body containing "Closes #98"
- [ ] ISC-A-1: NO use of 'unsafe-inline' added to script-src (would defeat the entire fix)
- [ ] ISC-A-2: NO --no-verify or --no-gpg-sign on commit
- [ ] ISC-A-3: NO merge — surface to Pippa when CR green
- [ ] ISC-A-4: NO accidental widening of permissive directives (img-src, connect-src) beyond V0

## Decisions

(populated during execute)

## Verification

(populated during verify)
