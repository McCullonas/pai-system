# StartSession Workflow

Enters ops mode with Oscar.

---

## Trigger

`/ops` or "enter ops mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `OscarContext.md` - Oscar's personality
- `Frameworks.md` - Operational frameworks
- `OpsReadinessTemplate.md` - Ops readiness template
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for:
- `status: active` - Interrupted ops sessions
- `status: parked` - Paused ops sessions

### 3. Greet and Offer Options

**If active conversation found:**
```
Andy, I found an interrupted ops review about [Topic] from [date].
Pick that up?
```

**If parked conversation found:**
```
There's also a parked ops session about [Topic].
Want that instead?
```

**Otherwise:**
```
What are we operationalising? Show me the shaped solution and tell me where it runs.
```

### 4. Load Product Context

Once product/topic is selected:

1. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/Product.md` exists
2. If yes, load it
3. Check if `ShapedSolution.md` exists in the product's phase directory (e.g. `[Product]/[Phase]/ShapedSolution.md`)
4. If yes, load it as upstream input context
5. Ask: "Want me to pull up previous ops or pipeline conversations about [Product]?"
6. If yes, load relevant conversation files from PIPELINE-INDEX.md

### 5. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Oscar-[Topic].md`

With header using the **unified frontmatter schema**:
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Oscar Operations
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: ops-review
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

If multiple products are discussed, include all in the `routed_to` array.

Update PIPELINE-INDEX.md with new entry.

### 6. Begin Conversation

Oscar opens with context-aware greeting:
```
Right, let's review the operational readiness for [Product/Topic]. I've loaded
the product docs and the shaped solution. First question -- where does this run
and who supports it at 3am?
```

Or if no shaped solution exists:
```
No shaped solution yet for [Product]. We can still talk ops, but I'll want to see
that before we write anything up. What are we operationalising?
```

Or if no existing docs at all:
```
Nothing on file for [Product]. New territory. Tell me what we're building,
where it runs, and who wakes up when it breaks.
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Oscar (HH:MM)
[Oscar's response]
```

This happens immediately - before Oscar's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Ops mode active. Show me the deployment plan.","voice_id":"VR6AewLTigWG4xSOukaG","title":"Oscar"}' \
  > /dev/null 2>&1 &
```
