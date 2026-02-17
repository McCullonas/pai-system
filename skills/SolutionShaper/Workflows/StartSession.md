# StartSession Workflow

Enters shape mode with Sam.

---

## Trigger

`/shape` or "enter shape mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `SamContext.md` - Sam's personality
- `Frameworks.md` - Shaping frameworks
- `ShapedSolutionTemplate.md` - Shaped solution template
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for:
- `status: active` - Interrupted shaping sessions
- `status: parked` - Paused shaping sessions

### 3. Greet and Offer Options

**If active conversation found:**
```
Andy, I found an interrupted shaping session about [Topic] from [date].
Pick that up?
```

**If parked conversation found:**
```
There's also a parked shaping session about [Topic].
Want that instead?
```

**Otherwise:**
```
What are we shaping? And more importantly -- what's the appetite?
```

### 4. Load Product Context

Once product/topic is selected:

1. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/Product.md` exists
2. If yes, load it
3. Ask: "Want me to pull up previous shaping or pipeline conversations about [Product]?"
4. If yes, load relevant conversation files from PIPELINE-INDEX.md

### 5. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Sam-[Topic].md`

With header using the **unified frontmatter schema**:
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Sam Shaping
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: shaping
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

Sam opens with context-aware greeting:
```
Right, let's shape [Product/Topic]. I've loaded the current product docs
and the infrastructure map. First things first -- what's the appetite?
```

Or if no existing docs:
```
No existing docs for [Product]. New territory. Let's start with the
basics: what problem are we solving, and how much is it worth to solve?
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Sam (HH:MM)
[Sam's response]
```

This happens immediately - before Sam's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Shape mode active. What are we building?","voice_id":"pNInz6obpgDQGcFmaJgB","title":"Sam"}' \
  > /dev/null 2>&1 &
```
