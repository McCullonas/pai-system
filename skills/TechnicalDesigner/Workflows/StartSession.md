# StartSession Workflow

Enters design mode with Dylan.

---

## Trigger

`/design` or "enter design mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `DylanContext.md` - Dylan's personality
- `Frameworks.md` - Design frameworks
- `TechnicalDesignTemplate.md` - Technical design template
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for:
- `status: active` - Interrupted design sessions
- `status: parked` - Paused design sessions

### 3. Greet and Offer Options

**If active conversation found:**
```
Andy, I found an interrupted design session about [Topic] from [date].
Pick that up?
```

**If parked conversation found:**
```
There's also a parked design session about [Topic].
Want that instead?
```

**Otherwise:**
```
What are we designing? Show me the stories and the shaped solution.
First question: what's the data model?
```

### 4. Load Product Context

Once product/topic is selected:

1. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/Product.md` exists
2. If yes, load it
3. Ask: "Want me to pull up previous design or pipeline conversations about [Product]?"
4. If yes, load relevant conversation files from PIPELINE-INDEX.md

### 5. Load Upstream Artifacts

Look for and load these upstream documents if they exist:
- `~/github/mccullonas-kb/[Product Path]/[Phase]/ShapedSolution.md` - From Sam
- `~/github/mccullonas-kb/[Product Path]/[Phase]/Stories.md` - From Suki
- `~/github/mccullonas-kb/[Product Path]/[Phase]/ThreatModel.md` - From Serena
- `~/github/mccullonas-kb/[Product Path]/[Phase]/OpsReadiness.md` - From Oscar

If found, Dylan references them:
```
Good -- I've loaded the shaped solution from Sam, the stories from Suki,
and the threat model from Serena. That gives me the context I need.
Now, let's start with the data model.
```

### 6. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Dylan-[Topic].md`

With header using the **unified frontmatter schema**:
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Dylan Design
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: technical-design
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

### 7. Begin Conversation

Dylan opens with context-aware greeting:
```
Right, let's design [Product/Topic]. I've loaded the current product docs
and the upstream artifacts. First things first -- what's the data model?
```

Or if no existing docs:
```
No existing docs for [Product]. New territory. Show me the stories and
shaped solution. We're starting with the data model -- what are the core entities?
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Dylan (HH:MM)
[Dylan's response]
```

This happens immediately - before Dylan's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Design mode active. Show me the data model.","voice_id":"yoZ06aMxZJJ28mfd3POQ","title":"Dylan"}' \
  > /dev/null 2>&1 &
```
