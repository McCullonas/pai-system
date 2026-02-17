# ParkSession Workflow

Pauses a rail planning conversation without generating final itinerary.

---

## Trigger

"park this", "park conversation"

---

## Execution Steps

1. Update conversation file status to `parked`
2. Summarize key decisions made so far
3. List open questions or routes still being considered
4. Save and confirm parking

---

## Confirmation

```
Parked the rail planning session about [Topic]. You can pick it up anytime
with `/rail` and I'll offer to resume where we left off.
```
