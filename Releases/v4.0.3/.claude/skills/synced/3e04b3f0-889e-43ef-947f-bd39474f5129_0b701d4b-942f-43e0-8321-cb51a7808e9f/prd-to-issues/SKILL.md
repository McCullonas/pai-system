---
name: prd-to-issues
description: "Break a PRD into independently-grabbable GitHub issues using vertical slices (tracer bullets)."
---

# Plan to Issues

Turn an **approved implementation plan** into grabbable GitHub issues — generating one phase at a time.

This is the third stage of the pipeline: **write-a-prd → prd-to-plan → plan-to-issues**.

## When to use this vs prd-to-issues

- Use **plan-to-issues** (this skill) when a phased plan already exists (from `prd-to-plan`). The plan has already decided the vertical slicing, sequencing, and any gates; issues are generated *from the plan* so they can never silently disagree with what the user approved.
- Use **prd-to-issues** for the lightweight path: a small PRD going straight to issues with no intermediate plan.

Do NOT re-slice the PRD from scratch here. The plan owns the slice decision. This skill *sub-divides each phase* into thinner grabbable issues and adds what the plan lacks: HITL/AFK tags, a dependency graph, per-issue templates, and a per-phase QA issue.

## Process

### 1. Locate the plan and its parent PRD

Ask the user for the plan's GitHub issue number (or URL). Fetch it with `gh issue view <number>` (with comments). From the plan, also find and fetch the **parent PRD** it references, so user-story numbers resolve.

If no plan exists, stop and tell the user to run `prd-to-plan` first (or `prd-to-issues` for the direct, no-plan path).

### 2. Pick the target phase

By default, generate issues for **one phase at a time**, starting from the earliest phase without issues. This is deliberate: plans often contain gates (e.g. "judge X before committing to Y"), and generating issues for every phase up front creates tickets for work that may never happen.

If the plan has no gates and the user explicitly wants all phases at once, that is allowed — but confirm it first.

### 3. Explore the codebase (optional)

If you have not already explored the codebase, do so to ground the issue breakdown in the real integration layers.

### 4. Sub-divide the chosen phase into tracer-bullet issues

The phase is already a vertical slice. Break it into thinner slices that are each independently grabbable, preserving the phase grouping.

Slices may be 'HITL' or 'AFK'. HITL slices require human interaction (an architectural decision, a credential/setup step, a design review). AFK slices can be implemented and merged without human interaction. Prefer AFK over HITL where possible.

<vertical-slice-rules>
- Each issue delivers a narrow but COMPLETE path through every layer it touches (schema, API, UI, infra, tests)
- A completed issue is demoable or verifiable on its own
- Prefer many thin issues over few thick ones
- Carry the phase's acceptance criteria down into the issues; do not invent scope the plan didn't authorize
- Map each issue back to the PRD user-story numbers the phase listed
</vertical-slice-rules>

Dependencies:
- Capture **intra-phase** dependencies between the new issues (`Blocked by`).
- Capture **cross-phase** dependencies: issues in this phase are typically blocked by the prior phase's completion — reference the prior phase's QA issue if it exists.

Always create a final **per-phase QA issue** with a detailed manual QA plan for everything in this phase that needs human verification. It is the last item in the phase's dependency graph, blocked by all other issues in the phase, and is HITL.

### 5. Quiz the user

Present the proposed breakdown for the phase as a numbered list. For each issue show:

- **Title**: short descriptive name
- **Type**: HITL / AFK
- **Blocked by**: which issues (intra- or cross-phase) must complete first
- **User stories covered**: by number from the parent PRD

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any issues be merged or split further?
- Are the correct issues marked HITL vs AFK?

Iterate until the user approves the breakdown for this phase.

### 6. Create the GitHub issues

For each approved issue, create a GitHub issue with `gh issue create`, in dependency order (blockers first) so you can reference real issue numbers in `Blocked by`. Use the template below.

<issue-template>
## Parent PRD

#<prd-issue-number>

## Plan phase

From plan #<plan-issue-number> — **Phase <n>: <phase title>**

## What to build

A concise description of this vertical slice. Describe end-to-end behavior, not layer-by-layer implementation. Reference sections of the plan/PRD rather than duplicating them.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Type

HITL or AFK

## Blocked by

- Blocked by #<issue-number> (if any)

Or "None - can start immediately" if no blockers.

## User stories addressed

Reference by number from the parent PRD:

- User story 3
- User story 7
</issue-template>

### 7. Link back, don't mutate

After creating the phase's issues, add a comment on the **plan** issue listing the new issue numbers under their phase heading, so the plan stays the live map. Do NOT close or modify the parent PRD or the plan body. When the user is ready for the next phase, repeat from step 2.
