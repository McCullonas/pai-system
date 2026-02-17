# Shaped Solution Template

This template defines the structure for ShapedSolution.md files. Focus on SHAPE (boundaries, appetite, direction), not DETAIL (implementation specifics).

---

## Template Structure

```markdown
# Shaped Solution: [Feature/Product Name]

## Appetite

*How much time and energy is this worth?*

**Appetite:** [Small batch (1-2 weeks) | Medium batch (3-4 weeks) | Big batch (6+ weeks)]
**Phase:** [POC | MVP | Release-1 | etc.]
**Product:** [Product name from KB]

## Problem Statement

*What specific problem are we solving? Not the feature -- the problem.*

2-3 paragraphs. User-focused. What pain exists today?

## Solution Direction

*How are we approaching this? High-level shape, not detail.*

Enough to show the approach without constraining implementation.

## What's In (Scope)

*Explicitly included:*

- [Capability 1]
- [Capability 2]

## What's Out (Explicitly Excluded)

*Explicitly NOT included (prevents scope creep):*

- [Thing 1] - Why it's out
- [Thing 2] - Why it's out

## High-Level Architecture

*System context and component boundaries*

[Mermaid C4 or flowchart diagram]

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision 1] | [What we chose] | [Why] |

## Existing Infrastructure to Reuse

*What existing systems does this build on?*

- [System 1] - How it's used
- [System 2] - How it's used

## Risks and Rabbit Holes

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Plan] |

## Handoff Notes

*Context for downstream pipeline agents:*

**For Security Advisor (Serena):** [Key security considerations]
**For Operations Advisor (Oscar):** [Key operational considerations]
**For Story Crafter (Suki):** [Suggested decomposition points]

## References

[1] Source description
    Path: _sources/...
```

---

## Guidelines

**Do:**
- Focus on SHAPE, not DETAIL
- Include explicit scope boundaries (in/out)
- Use Mermaid for architecture diagrams
- Cite the conversation file as a reference
- Include handoff notes for downstream agents
- Be specific about appetite and phase
- Document what's explicitly excluded and why

**Don't:**
- Include implementation details (that's for engineering)
- Make up technical specifics not discussed
- Skip the "What's Out" section -- it prevents scope creep
- Write wireframes or detailed UI specs
- Omit the risk assessment
- Forget to reference existing infrastructure

---

## Empty Section Handling

Every ShapedSolution.md must include ALL sections. If no data exists:

```markdown
## Existing Infrastructure to Reuse

*Not yet identified. Needs review against current systems.*
```

This highlights gaps rather than hiding them.

---

## Section Quick Reference

| Section | Key Question | Source |
|---------|--------------|--------|
| Appetite | How much is it worth? | Shape Up framework |
| Problem Statement | What pain exists? | Conversation |
| Solution Direction | How do we approach? | Conversation |
| What's In | What's included? | Scope decisions |
| What's Out | What's excluded? | Scope decisions |
| Architecture | How does it fit? | C4 / Breadboarding |
| Key Decisions | What did we choose? | Conversation |
| Reuse | What already exists? | Build vs Buy |
| Risks | What could derail us? | Risk Assessment |
| Handoff Notes | What do others need? | Conversation |
| References | Where did this come from? | Conversation file |
