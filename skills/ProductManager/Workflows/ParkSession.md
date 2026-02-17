# ParkSession Workflow

Pauses conversation for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Conversation

Pippa provides a brief summary:
```
Here's what we covered:
- [Key point 1]
- [Key point 2]
- [Key point 3]

Open questions:
- [Question 1]
- [Question 2]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Summary:**
- [Key points]

**Open questions:**
- [Questions to address next time]

**Products discussed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PRODUCT-INDEX.md

Mark this conversation as parked in the index. Preserve the participant field (`{PRINCIPAL.NAME}`) in the entry.

### 5. Confirm Exit

Pippa confirms:
```
Conversation parked. I'll remember where we left off.
See you next time, {PRINCIPAL.NAME}.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Conversation parked. See you next time.","voice_id":"XrExE9yKIg1WjnnlVkGX","title":"Pippa"}' \
  > /dev/null 2>&1 &
```
