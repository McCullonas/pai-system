# WriteUp Workflow

Generates user stories document from conversation.

---

## Trigger

"write it up", "generate stories", "write up the stories"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- Stories discussed and their acceptance criteria
- Dependency relationships between stories
- NFRs from security and ops reviews
- MoSCoW prioritization decisions
- Story map / user journey backbone
- INVEST assessments

### 2. Identify Products and Phase

Confirm with Andy:
- "I'll be writing up stories for [Product]. Correct?"
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
- Load existing Stories.md for the same phase if it exists
- Load ShapedSolution.md, ThreatModel.md, OpsReadiness.md for cross-reference
- Note what needs updating vs creating fresh

### 4. Generate Stories.md

Follow `UserStoryTemplate.md` structure:

1. **Overview** - Product, phase, upstream artifact references
2. **Story Map** - User journey backbone with stories organized by activity
3. **MoSCoW Summary** - Priority counts and story IDs
4. **Stories** - Each story with:
   - As a / I want / So that
   - Priority, estimate, dependencies
   - Given/When/Then acceptance criteria
   - NFR criteria with source traceability
   - INVEST check
5. **Dependency Chain** - Mermaid diagram of story ordering
6. **NFR Source Traceability** - Full traceability table
7. **Handoff Notes** - For Dylan (technical design) and Bea (engineering)
8. **References** - Cite the conversation file and upstream artifacts

### 5. Write Output File

Output location: `~/github/mccullonas-kb/[Product Path]/[Phase]/Stories.md`

- `[Product Path]` resolved from routed_to mapping
- `[Phase]` from pipeline_stage or asked from user (POC, MVP, Release-1, etc.)

Create the phase directory if it does not exist:
```bash
mkdir -p ~/github/mccullonas-kb/[Product Path]/[Phase]/
```

### 6. Add References

At end of Stories.md:
```markdown
## References

[1] Story crafting conversation with Suki - [YYYY-MM-DD]
    Path: _sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Suki-[Topic].md

[2] Shaped Solution
    Path: [Product Path]/[Phase]/ShapedSolution.md

[3] Threat Model
    Path: [Product Path]/[Phase]/ThreatModel.md

[4] Ops Readiness
    Path: [Product Path]/[Phase]/OpsReadiness.md
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
Stories written. Here's what I produced:

**[Product Name] - [Phase]** (Stories.md)
- [N] stories, all passing INVEST
- MoSCoW: [N] Must, [N] Should, [N] Could, [N] Won't
- [N] security NFRs and [N] ops NFRs integrated
- Dependency chain mapped with [N] critical path stories

Handoff notes ready for Dylan (technical design) and Bea (engineering).

Want me to show you the full document?
```

Suki confirms: "Stories written. Every one passes INVEST. Dependency chain is clear. Over to Dylan for technical design."

---

## Draft Mode

For experimental or early-stage story crafting:
- Write to `Stories-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Stories written. Every one passes INVEST. Over to Dylan for technical design.","voice_id":"21m00Tcm4TlvDq8ikWAM","title":"Suki"}' \
  > /dev/null 2>&1 &
```

### 10. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
PIPELINE STATUS: [Feature/Product Name]
-----------------------------------------
1.  Product Definition (Pippa)      [Complete | Not started]
2a. Solution Shaping (Sam)          [Complete | Not started]
2b. Security Review (Serena)        [Complete | Not started]
2c. Ops Review (Oscar)              [Complete | Not started]
3.  Story Breakdown (Suki)          [Complete]    <- YOU ARE HERE
4.  Technical Design (Dylan)        [Not started]
5.  Build (Bea)                     [Not started]
```

3. Offer next step:
```
Stories are ready. Next: `/design` to start technical design with Dylan.
Or "park this" to come back later.
```
