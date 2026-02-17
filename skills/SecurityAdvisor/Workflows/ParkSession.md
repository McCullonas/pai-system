# ParkSession Workflow

Pauses security review for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Security Review

Serena provides a focused security summary:
```
Here's where we stand:

**Threats identified:**
- [Threat 1 - STRIDE category - DREAD score]
- [Threat 2 - STRIDE category - DREAD score]

**STRIDE gaps (not yet analysed):**
- [Components or categories not yet covered]

**Open risks:**
- [Risk 1 - status]
- [Risk 2 - status]

**Pending DPIAs:**
- [DPIA 1 - reason]

**SDL compliance gaps:**
- [Gap 1]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Threats identified:**
- [Threat list with STRIDE categories and DREAD scores]

**STRIDE coverage:**
- [Components analysed / remaining]

**Open risks:**
- [Risks requiring resolution]

**Pending DPIAs:**
- [DPIAs that need to be completed]

**SDL compliance gaps:**
- [Gaps identified against SDL practices]

**Products reviewed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this conversation as parked in the index.

### 5. Confirm Exit

Serena confirms:
```
Session parked. Open threats documented. Don't ship without resolving them.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Session parked. Open threats documented. Do not ship without resolving them.","voice_id":"ErXwobaYiN019PkySvjV","title":"Serena"}' \
  > /dev/null 2>&1 &
```
