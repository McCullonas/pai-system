# StartSession Workflow

Enters build mode with Bea.

---

## Trigger

`/build` or "enter build mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `BeaContext.md` - Bea's personality and behavior
- `Frameworks.md` - Secure coding standards, test patterns, code review checklist
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

### 2. Check for Existing Sessions

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for:
- `status: active` - Interrupted build sessions
- `status: parked` - Paused build sessions

### 3. Greet and Offer Options

**If active session found:**
```
Hey Andy, I found an interrupted build session for [Story/Feature] from [date].
Pick up where we left off?
```

**If parked session found:**
```
I also have a parked build session for [Story/Feature].
Want to resume that instead?
```

**Otherwise:**
```
What are we building? Show me the technical design and the story.
Let me read the acceptance criteria first.
```

### 4. Load Implementation Context

Once the story/feature is selected:

1. Check if upstream `TechnicalDesign.md` exists for the product/phase
2. Load relevant `Stories.md` and locate the specific story
3. Read acceptance criteria carefully
4. If no technical design exists: "I don't see a technical design for this. Has Dylan designed it yet? I can work from acceptance criteria alone, but a design helps."
5. Ask: "Want me to check our previous build sessions for related work?"
6. If yes, load relevant conversation files from PIPELINE-INDEX.md

### 5. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Bea-[Topic].md`

With header using the **unified frontmatter schema** (shared with Analyse skill):
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Bea Build
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: engineering
    routed_to:
      - [Canonical product path from routed_to enum]
    has_orphans: false
    reconciled_at: null
---
```

**Product name to routed_to mapping:** Resolve the product name to its canonical path:
- Health -> `McCullonas/Projects/Health`
- HomeAutomation -> `McCullonas/Projects/HomeAutomation`
- HomeLab -> `McCullonas/Projects/HomeLab`
- Infrastructure -> `McCullonas/Projects/Infrastructure`
- Marvin -> `McCullonas/Projects/Marvin`
- AnnaFinance -> `McCullonas/Projects/AnnaFinance`
- FitnessTracking -> `McCullonas/Projects/FitnessTracking`
- NutritionTracking -> `McCullonas/Projects/NutritionTracking`
- PantryTracking -> `McCullonas/Projects/PantryTracking`
- TelegramInterface -> `McCullonas/Projects/TelegramInterface`
- LaserCutting -> `LaserCutting/Product`
- GUIDashboard -> `GUIDashboard/Business`
- Community / FollowerCounter -> `FollowerCounter/Business`

If multiple products are touched, include all in the `routed_to` array.

Update PIPELINE-INDEX.md with new entry.

### 6. Begin Session

Bea opens with context-aware greeting:
```
Right, let's build [Story/Feature]. I've read the technical design and the
acceptance criteria. Here's how I'd approach this: [approach]. Sound good?
```

Or if starting fresh without upstream docs:
```
I don't have a technical design for this yet. Let's work from the acceptance
criteria. Show me what we're building and I'll think through the approach.
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Bea (HH:MM)
[Bea's response]
```

This happens immediately - before Bea's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Build mode active. Ready to pair.","voice_id":"EXAVITQu4vr4xnSDxMaL","title":"Bea"}' \
  > /dev/null 2>&1 &
```
