# WriteUp Workflow

Generates session summary. Unlike other agents, Bea does not produce a separate artifact document -- the code IS the artifact. The WriteUp is a session summary appended to the conversation file.

---

## Trigger

"write it up", "session summary", "wrap it up"

---

## Execution Steps

### 1. Review Session

Read the full conversation file and extract:
- Stories worked on and their completion status
- Tests written and their pass/fail status
- Acceptance criteria verified
- Design deviations (if any, with justification)
- Security issues found and addressed
- Dependencies added or updated
- Tech debt items identified

### 2. Confirm with Andy

```
Here's what I'm logging for this build session:

**Completed:** [N] stories
**In progress:** [M] stories
**Tests:** [P] passing, [Q] failing
**Tech debt filed:** [R] items

Sound right, or did I miss anything?
```

### 3. Append Session Summary

Append to the end of the conversation file (not a separate document):

```markdown
---

## Build Session Summary

**Date:** [YYYY-MM-DD]
**Duration:** [approximate]
**Product:** [Product name]

### Stories Completed
| Story | ACs Met | Tests | Notes |
|-------|---------|-------|-------|
| [Story 1] | 4/4 | 6 passing | Clean implementation |
| [Story 2] | 3/3 | 4 passing | Minor refactor needed (TD filed) |

### Stories In Progress
| Story | ACs Met | Tests | Remaining |
|-------|---------|-------|-----------|
| [Story 3] | 2/4 | 3 passing, 1 failing | Need to implement edge case handling |

### Test Summary
- **Total tests written:** [N]
- **Passing:** [P]
- **Failing:** [Q]
- **Coverage notes:** [Any gaps worth noting]

### Security Notes
- [Any security items addressed or flagged]

### Tech Debt Filed
| Item | Description | Priority |
|------|-------------|----------|
| [TD-1] | [Description] | [Low/Medium/High] |

### Design Deviations
- [Any deviations from Dylan's technical design, with justification]
- [Or: "None -- implementation matches technical design"]

### Dependencies Added/Updated
- [List of dependency changes, with scan results]
- [Or: "No dependency changes"]
```

### 4. Update Conversation Status

In the `reviews.product` frontmatter block:
- Set `status: written_up`
- Set `reviewed_at` to the current ISO-8601 timestamp (e.g. `"2026-02-07T15:30:00Z"`)
- Ensure `routed_to` reflects all products that were actually worked on

### 5. Update PIPELINE-INDEX.md

Mark session as written_up in index.

### 6. Confirm Completion

Bea confirms:
```
Build session complete. [N] stories implemented, [P] tests passing.
Tech debt logged. The code is the artifact -- session log updated.
```

---

## No Separate Artifact

Unlike ProductManager (Product.md) or TechnicalDesigner (TechnicalDesign.md), the EngineerAgent does NOT produce a separate artifact document. The code changes in the actual repository are the artifact. The session summary in the conversation file provides the paper trail.

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Build session complete. Session log updated.","voice_id":"EXAVITQu4vr4xnSDxMaL","title":"Bea"}' \
  > /dev/null 2>&1 &
```

---

### 7. Pipeline Handoff

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
3.  Story Breakdown (Suki)          [Complete | Not started]
4.  Technical Design (Dylan)        [Complete | Not started]
5.  Build (Bea)                     [Complete]    <-- YOU ARE HERE
```

3. Offer next step:
```
Build complete. Pipeline finished for this feature!
To start the next iteration or a new feature: `/product` with Pippa.
```
