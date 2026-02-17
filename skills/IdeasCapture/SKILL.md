# Ideas Capture Skill

**Version:** 1.1
**Author:** Andy
**Status:** Active

---

## Purpose

Two-stage idea management: instant capture for fleeting thoughts, structured review for deep exploration.

---

## Triggers

### Capture Mode (Stage 1)
- "I've had an idea"
- "idea:"
- "quick idea"
- "capture this"
- "add to ideas queue"

### Review Mode (Stage 2)
- "review ideas"
- "ideas queue"
- "flesh out ideas"
- "let's look at the ideas"
- "idea review session"

---

## Modes

### Mode 1: CAPTURE

**Purpose:** Instant, friction-free idea logging. Phone-friendly.

**User Experience:**
- Response is MINIMAL: "Got it. Queued as idea #{N}."
- No questions asked
- No conversation started

**Behind the Scenes (Background Inference):**
After acknowledging, {DAIDENTITY.NAME} infers:
1. **Inferred meaning** - What the user probably means
2. **Possible intents** - 3-10 guesses at what they're trying to achieve

This inference is stored WITH the idea, marked as provisional.

**What gets stored:**
```json
{
  "id": "idea-007",
  "captured": "2026-02-05T08:49:00Z",
  "raw": "User's exact words",
  "inferred_meaning": "What {DAIDENTITY.NAME} thinks this means",
  "possible_intents": [
    "You might be trying to...",
    "Or perhaps you want to...",
    "Another possibility is..."
  ],
  "status": "queued",
  "review_progress": null
}
```

**Critical:** The user sees ONLY "Got it. Queued." The inference happens silently.

---

### Mode 2: REVIEW

**Purpose:** Deep dive into queued ideas with structured questioning.

**Entry Point:**
Show the queue, let user pick which idea to review.

**Review Framework - 6 Steps:**

Exit is available after ANY step. Progress is tracked.

#### Step 1: CLARIFY
Play back the inference and confirm:
> "You said: *[raw idea]*
>
> I inferred you meant: *[inferred meaning]*
>
> Your intent might be:
> 1. [possible intent]
> 2. [possible intent]
> 3. [possible intent]
>
> Which resonates, or is it something else?"

Refine until meaning and intent are confirmed.

#### Step 2: INTENT (Outcome Definition)
> "What does success look like for this?"
> "How would you know it's working?"
> "What action does this enable?"

Turn vague intent into concrete, measurable outcomes.

#### Step 3: WHY (5 Whys)
Dig to root motivation. The stated intent may be a symptom of a deeper need.
> "Why does that matter?"
> "And why is that important?"

#### Step 4: ANTI-GOALS
> "What do you want to avoid?"
> "What would failure look like?"
> "What's the worst outcome?"

#### Step 5: CLASSIFY & ROUTE
Determine what this idea IS and where it belongs:
- New project?
- PAI extension?
- Process change?
- Something else?

Route to appropriate location (mccullonas-kb, extensions, task list, etc.)

#### Step 6: VALIDATE
> "Is this worth pursuing now?"

Optional: Invoke FirstPrinciples (challenge assumptions) or RedTeam (stress-test) for deeper analysis.

Final status: ROUTED, SOMEDAY, or DISCARDED

---

**Progress Tracking:**

Ideas track which step they're at:

```json
{
  "id": "idea-007",
  "raw": "...",
  "inferred_meaning": "...",
  "possible_intents": ["..."],

  "review_progress": {
    "current_step": 2,
    "step_name": "INTENT",
    "last_reviewed": "2026-02-05T10:30:00Z",
    "notes": "Confirmed intent is X, need to define success criteria",
    "completed_steps": {
      "1_clarify": { "confirmed_meaning": "...", "confirmed_intent": "..." }
    }
  },

  "status": "in_progress"
}
```

When resuming: "Where were we with idea #7?" picks up at the right step.

---

## Storage

**Location:** `~/.claude/STATE/ideas-queue.json`

**Structure:**
```json
{
  "ideas": [],
  "stats": {
    "total_captured": 0,
    "total_reviewed": 0,
    "last_capture": null,
    "last_review": null
  }
}
```

---

## Commands

| Command | Action |
|---------|--------|
| `idea: <text>` | Capture mode - queue the idea |
| `/ideas` | Show queue summary (count by status) |
| `/ideas review` | Start review session |
| `/ideas review #N` | Resume review of specific idea |
| `/ideas clear reviewed` | Archive completed ideas |

---

## Example Interactions

### Capture (Mobile, Quick)

**User:** "idea: what if {DAIDENTITY.NAME} could send me a daily summary of knowledge gaps"

**{DAIDENTITY.NAME}:** "Got it. Queued as idea #7."

*(End of interaction - inference happens silently)*

---

### Review Session

**User:** "Let's review the ideas queue"

**{DAIDENTITY.NAME}:** "You have 7 ideas queued:

| # | Idea | Status | Step |
|---|------|--------|------|
| 1 | PAI packaging and portability | queued | - |
| 2 | Connect Slack to PAI | queued | - |
| 3 | Knowledge gap tracking | in_progress | Step 2 |
| ... | ... | ... | ... |

Which one would you like to review?"

**User:** "Let's do #3"

**{DAIDENTITY.NAME}:** "Picking up idea #3 at Step 2 (INTENT).

Last time we confirmed: You want a system to track what's missing from the KB.

What does success look like for this? How would you use this information?"

---

## Integration

- Reviewed ideas can become Tasks (TaskCreate)
- Reviewed ideas can feed into Projects in `~/github/mccullonas-kb/`
- PAI extensions go to `~/.claude/extensions/`
- Discarded ideas are archived, not deleted (learnings)
- Optional: FirstPrinciples skill for assumption-challenging
- Optional: RedTeam skill for stress-testing ideas

---

## Design Rationale

This two-stage approach separates:
- **Capture velocity** (must be instant, zero friction)
- **Processing quality** (must be thorough, unhurried)

The background inference bridges the gap - capture is instant for the user, but the queue entry is pre-processed for efficient review.

Exit after any step accommodates:
- Insufficient information to continue
- Need time to think
- Low-priority ideas that don't warrant full exploration
