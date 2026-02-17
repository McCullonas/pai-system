# ParkSession Workflow

Pauses design session for later resumption.

---

## Trigger

"park this", "park conversation", "pause this"

---

## Execution Steps

### 1. Summarize Session

Dylan provides a design-focused summary:
```
Here's where the design stands:

Data model progress:
- [Entities defined / relationships mapped / gaps remaining]

API contracts defined:
- [Contracts completed / contracts pending]

ADRs drafted:
- [Decision records written]

Dependency decisions:
- [Dependencies assessed / pending assessment]

Implementation gaps:
- [What still needs design work]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Data model progress:**
- [Entity and relationship status]

**API contracts defined:**
- [Contract status]

**ADRs drafted:**
- [Decision records]

**Dependency decisions:**
- [Assessment status]

**Implementation gaps:**
- [What needs completing next time]

**Products discussed:** [List]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this conversation as parked in the index.

### 5. Confirm Exit

Dylan confirms:
```
Design session parked. Data model and contracts are in progress.
Resume to complete.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Design session parked. Data model and contracts are in progress. Resume to complete.","voice_id":"yoZ06aMxZJJ28mfd3POQ","title":"Dylan"}' \
  > /dev/null 2>&1 &
```
