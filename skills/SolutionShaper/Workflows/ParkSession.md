# ParkSession Workflow

Pauses shaping session for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Session

Sam provides a boundary-focused summary:
```
Here's where we stand:

Boundaries defined:
- [Boundary 1]
- [Boundary 2]

Scope decisions:
- IN: [What's included]
- OUT: [What's excluded]

Risks identified:
- [Risk 1]
- [Risk 2]

Open architectural questions:
- [Question 1]
- [Question 2]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Appetite:** [Agreed appetite or "not yet set"]

**Boundaries defined:**
- [Boundary decisions]

**Scope decisions:**
- IN: [Included items]
- OUT: [Excluded items]

**Risks identified:**
- [Risk items]

**Open architectural questions:**
- [Questions to address next time]

**Products discussed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this conversation as parked in the index.

### 5. Confirm Exit

Sam confirms:
```
Session parked. Boundaries are set. Pick this up when you're ready.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Session parked. Boundaries are set. Pick this up when ready.","voice_id":"pNInz6obpgDQGcFmaJgB","title":"Sam"}' \
  > /dev/null 2>&1 &
```
