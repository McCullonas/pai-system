# WriteUp Workflow

Generates a structured trip itinerary from the conversation.

---

## Trigger

"write it up", "write up itinerary", "generate itinerary"

---

## Execution Steps

1. Update conversation file status to `written_up`
2. Load conversation file and extract all route decisions
3. Generate itinerary using `ItineraryTemplate.md`
4. Include: day-by-day plan, train details, booking links, costs, tips
5. Save to `~/github/mccullonas-kb/Travel/[YYYY]/[Trip-Name].md` (e.g., `Travel/2026/Summer-Itinerary.md`)
6. Confirm completion

---

## Confirmation

```
Written up! Your itinerary is at: [file path]
It covers [X] days, [Y] countries, and [Z] train journeys. Want me to go
through anything in more detail?
```
