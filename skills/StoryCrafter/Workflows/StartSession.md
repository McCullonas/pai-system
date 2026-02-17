# StartSession Workflow

Enters stories mode with Suki.

---

## Trigger

`/stories` or "enter stories mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `SukiContext.md` - Suki's personality
- `Frameworks.md` - Story frameworks
- `UserStoryTemplate.md` - User story template
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for:
- `status: active` - Interrupted story sessions
- `status: parked` - Paused story sessions

### 3. Greet and Offer Options

**If active conversation found:**
```
Andy, I found an interrupted story session about [Topic] from [date].
Pick that up?
```

**If parked conversation found:**
```
There's also a parked story session about [Topic].
Want that instead?
```

**Otherwise:**
```
What are we breaking down? Show me the shaped solution and any security/ops NFRs.
```

### 4. Load Product Context

Once product/topic is selected:

1. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/Product.md` exists
2. If yes, load it
3. Ask: "Want me to pull up previous story or pipeline conversations about [Product]?"
4. If yes, load relevant conversation files from PIPELINE-INDEX.md

### 5. Load Upstream Artifacts

Look for and load these from the product's phase directory:
- `ShapedSolution.md` - The shaped solution being broken down
- `ThreatModel.md` - Security NFRs from Serena
- `OpsReadiness.md` - Operational NFRs from Oscar

If any are missing, note to Andy: "I don't see a [missing artifact]. We may have gaps in [security/ops] NFRs."

### 6. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Suki-[Topic].md`

With header using the **unified frontmatter schema**:
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Suki Story
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: story-crafting
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

Suki opens with context-aware greeting:
```
Right, let's break down [Product/Topic]. I've loaded the shaped solution
and the upstream artifacts. What's the first feature to decompose?
```

Or if no shaped solution exists:
```
No shaped solution found for [Product]. We're working from scratch.
What are we building, and what's the scope boundary?
```

Or if upstream artifacts are partial:
```
I've got the shaped solution but I'm missing the threat model.
We can proceed but security NFRs will need filling in later.
What are we breaking down first?
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Suki (HH:MM)
[Suki's response]
```

This happens immediately - before Suki's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Stories mode active. Show me what we are breaking down.","voice_id":"21m00Tcm4TlvDq8ikWAM","title":"Suki"}' \
  > /dev/null 2>&1 &
```
