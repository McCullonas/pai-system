# StartSession Workflow

Enters product mode with Pippa.

---

## Trigger

`/product` or "enter product mode"

---

## Execution Steps

### 1. Load Context

**Always load:**
- `PippaContext.md` - Pippa's personality
- `Frameworks.md` - Decision frameworks
- `ProductTemplate.md` - Documentation template
- `~/github/mccullonas-kb/PROJECTS.md` - Product overviews + relationships

### 2. Check for Existing Conversations

Read `~/github/mccullonas-kb/_sources/Meetings/PRODUCT-INDEX.md` (create if missing)

Index format: `date | path | participant | topics | status`

Filter by current user (`{PRINCIPAL.NAME}` from settings.json) — only show conversations where the participant field matches. Other users' conversations are invisible.

Look for:
- `status: active` - Interrupted conversations **for this user**
- `status: parked` - Paused conversations **for this user**

### 3. Greet and Offer Options

**If active conversation found for this user:**
```
Hi {PRINCIPAL.NAME}, I found an interrupted conversation about [Product] from [date].
Want to resume that?
```

**If parked conversation found for this user:**
```
I also have a parked conversation about [Product].
Want to pick that up instead?
```

**Otherwise:**
```
Hi {PRINCIPAL.NAME}! Which product would you like to discuss?
```

### 4. Load Product Context

Once product is selected:

1. Check if `~/github/mccullonas-kb/[Product-Path]/Product.md` exists (use the routed_to mapping above for the path)
2. If yes, load it
3. Ask: "Would you like me to recall our previous conversations about [Product]?"
4. If yes, load relevant conversation files from PRODUCT-INDEX.md

### 5. Create Conversation File

Create new file at:
`~/github/mccullonas-kb/_sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Pippa-[Product].md`

With header using the **unified frontmatter schema** (shared with Analyse skill):
```yaml
---
reviews:
  product:
    type: meeting
    import_date: "[YYYY-MM-DD]"
    participants:
      - {PRINCIPAL.NAME}
      - Pippa
    status: active
    reviewed_at: null
    mode: conversation
    confidence: high
    routed_to:
      - [Canonical product path from routed_to enum]
    has_orphans: false
    reconciled_at: null
---
```

**Product name → routed_to mapping:** Resolve the product name to its canonical path:
- 925Silver → `925Silver`
- AnnaFinance → `925Silver/AnnaFinance`
- FollowerCounter → `925Silver/FollowerCounter`
- LaserCutting → `925Silver/LaserCutting`
- Marvin → `Marvin`
- GUIDashboard → `Marvin/GUIDashboard`
- TelegramInterface → `Marvin/TelegramInterface`
- HomeLab → `HomeLab`
- HomeAutomation → `HomeAutomation`
- FitnessTracking → `FitnessTracking`
- NutritionTracking → `NutritionTracking`
- PantryTracking → `PantryTracking`

If multiple products are discussed, include all in the `routed_to` array.

Update PRODUCT-INDEX.md with new entry, including `{PRINCIPAL.NAME}` as the participant field.

### 6. Begin Conversation

Pippa opens with context-aware greeting:
```
Great, let's talk about [Product]. I've loaded the current documentation
and our product relationship map. What would you like to explore?
```

Or if no existing docs:
```
I don't have existing documentation for [Product]. Is this a new product,
or should I look harder? Let's start building the picture together.
```

### Verbose Output Hint

Include once in your first greeting: "Tip: press `Ctrl+O` to toggle tool output detail if the diffs get noisy."

---

## Real-Time Logging

From this point, every exchange is appended to the conversation file:

```markdown
## Andy (HH:MM)
[User message]

## Pippa (HH:MM)
[Pippa's response]
```

This happens immediately - before Pippa's response is complete, the user's message is logged.

---

## Voice Notification

On session start:
```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Product mode active. Ready to discuss.","voice_id":"XrExE9yKIg1WjnnlVkGX","title":"Pippa"}' \
  > /dev/null 2>&1 &
```
