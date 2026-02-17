# ParkSession Workflow

Pauses ops review session for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Session

Oscar provides an ops-focused summary:
```
Here's where we stand:

Infrastructure decisions:
- [Decision 1]
- [Decision 2]

SLOs defined:
- [SLO 1]
- [SLO 2]

Monitoring gaps:
- [Gap 1]
- [Gap 2]

Support model gaps:
- [Gap 1]
- [Gap 2]

Open operational questions:
- [Question 1]
- [Question 2]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Infrastructure decisions:**
- [Decisions made]

**SLOs defined:**
- [Service level objectives agreed]

**Monitoring gaps:**
- [Observability items still needed]

**Support model gaps:**
- [Ownership/on-call items still needed]

**Open operational questions:**
- [Questions to address next time]

**Products discussed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this conversation as parked in the index.

### 5. Confirm Exit

Oscar confirms:
```
Session parked. Don't deploy without closing those monitoring gaps.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Session parked. Do not deploy without closing those monitoring gaps.","voice_id":"VR6AewLTigWG4xSOukaG","title":"Oscar"}' \
  > /dev/null 2>&1 &
```
