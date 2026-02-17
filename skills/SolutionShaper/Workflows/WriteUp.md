# WriteUp Workflow

Generates a shaped solution document from conversation.

---

## Trigger

"write it up", "generate shaped solution", "write up the shaped solution"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- Appetite agreed
- Problem statement
- Solution direction discussed
- Scope decisions (in and out)
- Architectural decisions and diagrams
- Existing infrastructure to reuse
- Risks and rabbit holes identified
- Handoff considerations

### 2. Identify Products and Phase

Confirm with Andy:
- "I'll be writing up a shaped solution for [Product]. Correct?"
- "What phase is this? POC, MVP, Release-1, or something else?"

Resolve the product to its canonical path using the routed_to mapping:
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

### 3. Load Existing Context

For the product:
- Load existing Product.md if it exists
- Load any existing ShapedSolution.md for the same phase
- Note what needs updating vs creating fresh

### 4. Generate ShapedSolution.md

Follow `ShapedSolutionTemplate.md` structure:

1. **Appetite** - From appetite discussion
2. **Problem Statement** - Synthesized from conversation
3. **Solution Direction** - From architectural discussions
4. **What's In** - From scope decisions
5. **What's Out** - From explicit exclusions
6. **High-Level Architecture** - From C4/breadboarding discussions (Mermaid diagrams)
7. **Key Decisions** - From decision points in conversation
8. **Existing Infrastructure to Reuse** - From Build vs Buy discussions
9. **Risks and Rabbit Holes** - From risk assessment
10. **Handoff Notes** - Context for Serena, Oscar, Suki
11. **References** - Cite the conversation file

### 5. Write Output File

Output location: `~/github/mccullonas-kb/[Product Path]/[Phase]/ShapedSolution.md`

- `[Product Path]` resolved from routed_to mapping
- `[Phase]` from pipeline_stage or asked from user (POC, MVP, Release-1, etc.)

Create the phase directory if it does not exist:
```bash
mkdir -p ~/github/mccullonas-kb/[Product Path]/[Phase]/
```

### 6. Add References

At end of ShapedSolution.md:
```markdown
## References

[1] Shaping conversation with Sam - [YYYY-MM-DD]
    Path: _sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Sam-[Topic].md
```

### 7. Update Conversation Status

In the `reviews.product` frontmatter block:
- Set `status: written_up`
- Set `reviewed_at` to the current ISO-8601 timestamp (e.g. `"2026-02-07T15:30:00Z"`)
- Ensure `routed_to` reflects the product that was written up

### 8. Update PIPELINE-INDEX.md

Mark conversation as written_up in index.

### 9. Present Results

Show Andy what was created:
```
Shaped solution written. Here's what I produced:

**[Product Name] - [Phase]** (ShapedSolution.md)
- Appetite: [X weeks]
- Scope: [N] items in, [M] explicitly out
- [N] risks mapped with mitigations
- Handoff notes ready for Serena, Oscar, and Suki

Boundaries are clear. Ready for the next stage of the pipeline.

Want me to show you the full document?
```

Sam confirms: "Shaped solution written. Boundaries are clear. Ready for Serena and Oscar."

---

## Draft Mode

For experimental or early-stage shaping:
- Write to `ShapedSolution-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Shaped solution written. Boundaries are clear. Ready for review.","voice_id":"pNInz6obpgDQGcFmaJgB","title":"Sam"}' \
  > /dev/null 2>&1 &
```

### 10. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
PIPELINE STATUS: [Feature/Product Name]
---
1.  Product Definition (Pippa)      [Complete | Not started]
2a. Solution Shaping (Sam)          [Complete]    <-- YOU ARE HERE
2b. Security Review (Serena)        [Not started]
2c. Ops Review (Oscar)              [Not started]
3.  Story Breakdown (Suki)          [Not started]
4.  Technical Design (Dylan)        [Not started]
5.  Build (Bea)                     [Not started]
```

3. Offer next step:
   - Full pipeline: "Next up: Serena (`/security`) and Oscar (`/ops`) can review in parallel. Start with either."
   - POC pathway: "POC pathway: Serena (`/security`) for a light-touch review, then Suki (`/stories`)."
   - Or "park this" to come back later.
