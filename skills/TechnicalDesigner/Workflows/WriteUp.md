# WriteUp Workflow

Generates a technical design document from conversation.

---

## Trigger

"write it up", "generate technical design", "write up the technical design"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- Data model decisions (entities, relationships, cardinality)
- API contracts defined (endpoints, request/response, errors)
- Architecture decisions and ADRs
- Component definitions and responsibilities
- Integration patterns chosen
- Dependencies assessed
- Implementation order discussed
- Security controls from threat model
- Infrastructure requirements

### 2. Identify Products and Phase

Confirm with Andy:
- "I'll be writing up a technical design for [Product]. Correct?"
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
- Load any existing TechnicalDesign.md for the same phase
- Load upstream artifacts: ShapedSolution.md, Stories.md, ThreatModel.md, OpsReadiness.md
- Note what needs updating vs creating fresh

### 4. Generate TechnicalDesign.md

Follow `TechnicalDesignTemplate.md` structure:

1. **Overview** - Product, phase, story references, upstream artifact references
2. **Data Model** - ER diagram (Mermaid), entity definitions, database choice with ADR
3. **API Contracts** - Complete endpoint specifications with error states
4. **Component Architecture** - Component diagram (Mermaid), definitions with story mapping
5. **Integration Patterns** - Pattern choices with rationale
6. **Dependencies** - Third-party with risk assessment, internal with contract references
7. **ADRs** - All architecture decision records from the session
8. **Implementation Plan** - Story-to-component mapping, suggested build order
9. **Infrastructure Spec** - Environment, IaC, CI/CD
10. **Security Implementation Notes** - From threat model, specific implementation guidance
11. **Handoff to Engineer (Bea)** - Starting point, patterns, test strategy
12. **References** - Cite the conversation file and all upstream artifacts

### 5. Write Output File

Output location: `~/github/mccullonas-kb/[Product Path]/[Phase]/TechnicalDesign.md`

- `[Product Path]` resolved from routed_to mapping
- `[Phase]` from pipeline_stage or asked from user (POC, MVP, Release-1, etc.)

Create the phase directory if it does not exist:
```bash
mkdir -p ~/github/mccullonas-kb/[Product Path]/[Phase]/
```

### 6. Add References

At end of TechnicalDesign.md:
```markdown
## References

[1] Design conversation with Dylan - [YYYY-MM-DD]
    Path: _sources/Meetings/[YYYY]/[MM]/[DD]/[YYYY-MM-DD]-Dylan-[Topic].md

[2] Shaped Solution - [YYYY-MM-DD]
    Path: [Product Path]/[Phase]/ShapedSolution.md

[3] User Stories - [YYYY-MM-DD]
    Path: [Product Path]/[Phase]/Stories.md

[4] Threat Model - [YYYY-MM-DD]
    Path: [Product Path]/[Phase]/ThreatModel.md
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
Technical design written. Here's what I produced:

**[Product Name] - [Phase]** (TechnicalDesign.md)
- Data model: [N] entities, [M] relationships
- API contracts: [N] endpoints fully specified
- ADRs: [N] decisions documented
- Dependencies: [N] assessed ([M] approved, [P] flagged)
- Stories mapped: [N] stories -> [M] components
- Implementation order: [N] stories sequenced

Every story has a component mapping. Over to Bea for implementation.

Want me to show you the full document?
```

Dylan confirms: "Technical design written. Every story has a component mapping. Over to Bea for implementation."

---

## Draft Mode

For experimental or early-stage design:
- Write to `TechnicalDesign-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Technical design written. Every story has a component mapping. Over to Bea for implementation.","voice_id":"yoZ06aMxZJJ28mfd3POQ","title":"Dylan"}' \
  > /dev/null 2>&1 &
```

### 10. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
PIPELINE STATUS: [Feature/Product Name]

1.  Product Definition (Pippa)      [Complete | Not started]
2a. Solution Shaping (Sam)          [Complete | Not started]
2b. Security Review (Serena)        [Complete | Not started]
2c. Ops Review (Oscar)              [Complete | Not started]
3.  Story Breakdown (Suki)          [Complete | Not started]
4.  Technical Design (Dylan)        [Complete]    <-- YOU ARE HERE
5.  Build (Bea)                     [Not started]
```

3. Offer next step:
```
Technical design complete. Next: `/build` to start implementation with Bea.
Or "park this" to come back later.
```
