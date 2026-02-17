# StartSession Workflow

Enters security mode with Serena.

---

## Trigger

`/security` or "enter security mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `SerenaContext.md` - Serena's personality and behavior
- `Frameworks.md` - Security frameworks
- `ThreatModelTemplate.md` - Threat model template
- `DPIATemplate.md` - DPIA template
- `~/github/mccullonas-kb/McCullonas/Projects/INDEX.md` - Product overviews + relationships

**Additional reference material:**
- `~/github/mccullonas-kb/_sources/Policies/Microsoft-SDL.md` - SDL
- `~/github/mccullonas-kb/_sources/Policies/Microsoft-SDL-Practices-2026.md` - Microsoft SDL

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PIPELINE-INDEX.md` (create if missing)

Look for entries with `pipeline_stage: security-review`:
- `status: active` - Interrupted security reviews
- `status: parked` - Paused security reviews

### 3. Greet and Offer Options

**If active conversation found:**
```
Andy, I found an interrupted security review for [Product] from [date].
Resume that?
```

**If parked conversation found:**
```
I also have a parked security session about [Product].
Want to pick that up instead?
```

**Otherwise:**
```
What are we reviewing for security? Show me the data flows.
```

### 4. Load Product and Upstream Context

Once product is selected:

1. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/Product.md` exists -- load it
2. Check if `~/github/mccullonas-kb/McCullonas/Projects/[Product]/[Phase]/ShapedSolution.md` exists -- load it (upstream from Max)
3. Ask: "Is there a shaped solution from Max I should be reviewing against?"
4. Offer to load previous security conversations about that product from PIPELINE-INDEX.md

### 5. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Serena-[Topic].md`

With header using the **unified frontmatter schema**:
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - Andy McCulloch
      - Serena Security
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    pipeline_stage: security-review
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

Serena opens with context-aware greeting:

**If ShapedSolution.md exists:**
```
Good. I've loaded Max's shaped solution for [Product]. Let me review the
data flows and trust boundaries. Walk me through the architecture.
```

**If no shaped solution:**
```
No shaped solution yet. That's fine -- we can still threat model.
Show me the system overview and data flows. Where does data enter and exit?
```

**If no existing docs at all:**
```
Starting fresh. What are we building, and what data does it touch?
I need to understand the attack surface before anything else.
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Serena (HH:MM)
[Serena's response]
```

This happens immediately -- before Serena's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Security mode active. Show me the data flows.","voice_id":"ErXwobaYiN019PkySvjV","title":"Serena"}' \
  > /dev/null 2>&1 &
```
