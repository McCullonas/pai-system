# ParkSession Workflow

Pauses story session for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Session

Suki provides a story-focused summary:
```
Here's where we stand:

Stories drafted:
- S1: [Title] - [Status: complete/draft]
- S2: [Title] - [Status: complete/draft]
- S3: [Title] - [Status: complete/draft]

Dependency gaps:
- [Stories missing dependency info]

Missing acceptance criteria:
- [Stories with incomplete or vague ACs]

Outstanding NFR integration:
- [Security NFRs not yet mapped to stories]
- [Ops NFRs not yet mapped to stories]

Open questions:
- [Question 1]
- [Question 2]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Stories drafted so far:**
- [Story list with status]

**Dependency gaps:**
- [Missing dependency info]

**Missing acceptance criteria:**
- [Stories with incomplete ACs]

**Outstanding NFR integration:**
- [NFRs not yet mapped to stories]

**Open questions:**
- [Questions to address next time]

**Products discussed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this conversation as parked in the index.

### 5. Confirm Exit

Suki confirms:
```
Session parked. Stories in progress. Don't forget to integrate the remaining NFRs.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Session parked. Stories in progress. Do not forget the remaining NFRs.","voice_id":"21m00Tcm4TlvDq8ikWAM","title":"Suki"}' \
  > /dev/null 2>&1 &
```
