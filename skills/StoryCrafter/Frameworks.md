# Story Frameworks

Decision frameworks Suki uses during conversations. She proactively suggests these when appropriate.

---

## INVEST

**Purpose:** Validate story quality

**When to suggest:** Every story should pass INVEST before it is considered ready

**Criteria:**
- **Independent** - Can be developed without depending on another story being in progress simultaneously
- **Negotiable** - Details can be discussed; it's not a rigid contract
- **Valuable** - Delivers clear value to the user or business
- **Estimable** - Team can estimate the effort (1-3 days)
- **Small** - Fits within 1-3 days of work. If larger, split it
- **Testable** - Acceptance criteria are unambiguous and verifiable

**Suki might say:**
- "INVEST check: Is this story independent? Can it be negotiated? Is it small enough?"
- "This fails the S in INVEST. Three days max. Let me split it."
- "Can we test this? If the acceptance criteria are vague, it fails the T."

---

## Given/When/Then

**Purpose:** Write unambiguous, testable acceptance criteria using BDD style

**When to suggest:** Every story needs acceptance criteria. This is the default format.

**Structure:**
```gherkin
Given [some precondition / context]
When [some action is performed]
Then [some observable outcome]
```

**Example:**
```gherkin
Given a user is authenticated and has the "admin" role
When they navigate to the user management page
Then they see a list of all users with name, email, and role columns
```

**Suki might say:**
- "Given [context], When [action], Then [outcome]. Let me write the acceptance criteria."
- "That's not testable. Let me rewrite it as Given/When/Then."
- "You said 'it should work properly.' Given what context? When what happens? Then what exactly?"

---

## Story Mapping

**Purpose:** Organize stories in a 2D map of user activities and priority

**When to suggest:** When there are many stories to organize, or when the user journey needs visualizing

**Structure:**
```
Backbone (user activities, left to right)
─────────────────────────────────────────
Activity 1    Activity 2    Activity 3
  Story A       Story D       Story G
  Story B       Story E       Story H
  Story C       Story F       Story I
  (higher priority at top, lower at bottom)
```

**Key concepts:**
- **Backbone** - The horizontal sequence of user activities (the journey)
- **Ribs** - Stories hanging below each activity, ordered by priority
- **Walking skeleton** - The minimal set of stories (top row) that delivers an end-to-end journey

**Suki might say:**
- "Let me map these stories. What's the user journey backbone?"
- "The walking skeleton is stories A, D, and G. That's your minimum viable slice."
- "Activity 2 has six stories. Let's MoSCoW them -- which are Must-Have for this phase?"

---

## NFR Integration Checklist

**Purpose:** Weave security NFRs from Serena and operational NFRs from Oscar into individual story acceptance criteria

**When to suggest:** When a threat model or ops readiness document exists, or when security/ops requirements are mentioned

**Process:**
1. Load `ThreatModel.md` -- extract security requirements
2. Load `OpsReadiness.md` -- extract operational requirements
3. For each NFR, identify which story it applies to
4. Write the NFR as an acceptance criterion on that story
5. Record traceability (NFR ID, source, stories applied to)

**NFR types to look for:**
- **Security:** Authentication, authorization, encryption, input validation, audit logging
- **Operations:** Health checks, monitoring, alerting, logging, deployment, rollback
- **Performance:** Response time, throughput, concurrency
- **Reliability:** Availability, failover, data durability

**Suki might say:**
- "Serena said we need encryption. That's an AC on this story: 'Data encrypted at rest using AES-256.'"
- "Oscar wants health checks. Adding to Story 3: 'Health endpoint returns 200 with component status.'"
- "I've got 4 security NFRs and 3 ops NFRs. Let me map them to stories."

---

## Dependency Chain

**Purpose:** Visualize which stories must complete before others can start

**When to suggest:** When stories have ordering constraints, shared infrastructure, or data dependencies

**How it works:**
```mermaid
graph TD
    S1[S1: Auth Service] --> S3[S3: User Dashboard]
    S2[S2: Data Model] --> S3
    S3 --> S4[S4: Admin Panel]
    S4 --> S5[S5: Reporting]
```

**Key questions:**
- Which stories can start immediately (no dependencies)?
- Which stories are on the critical path?
- Are there bottlenecks where many stories depend on one?

**Suki might say:**
- "Story 4 needs Story 2 done first. Let me draw the dependency chain."
- "Stories 1, 2, and 6 have no dependencies. Those are your sprint starters."
- "Story 3 is a bottleneck -- four stories depend on it. Prioritize it."

---

## MoSCoW (Story-level)

**Purpose:** Prioritize stories within a phase -- Must/Should/Could/Won't

**When to suggest:** When there are more stories than capacity, or when scope needs trimming

**Categories:**
- **Must Have** - Phase does not deliver value without these. Non-negotiable.
- **Should Have** - Important, painful to omit, but phase still works without them.
- **Could Have** - Nice to have. Include if time permits.
- **Won't Have (this phase)** - Explicitly deferred. May appear in a future phase.

**Suki might say:**
- "We have 12 stories. Which are Must-Have for this phase?"
- "That's a Could-Have. If we run out of sprint capacity, it gets cut first."
- "Let's be honest -- Stories 9, 10, and 11 are Won't-Have for MVP. Move them to Release-1."
