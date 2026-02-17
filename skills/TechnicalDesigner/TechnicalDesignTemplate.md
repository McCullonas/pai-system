# Technical Design Template

This template defines the structure for TechnicalDesign.md files. Focus on precise, implementable specifications that an engineer can build from without guesswork.

---

## Template Structure

```markdown
# Technical Design: [Feature/Product Name]

## Overview

**Product:** [Product name]
**Phase:** [POC | MVP | Release-1]
**Stories Covered:** [Story IDs from Stories.md]
**Shaped Solution:** [Reference]
**Threat Model:** [Reference]
**Ops Readiness:** [Reference]
**Date:** [YYYY-MM-DD]
**Author:** Dylan Design (Technical Designer)

## Data Model

### Entity-Relationship Diagram

[Mermaid ER diagram]

### Entity Definitions

| Entity | Description | Key Fields | Relationships |
|--------|------------|------------|---------------|
| [Entity 1] | [What it represents] | [Key fields] | [Relationships] |

### Database Choice

**Engine:** [PostgreSQL/DynamoDB/etc.]
**Rationale:** [Why this choice - ADR reference]

## API Contracts

### [Endpoint Group 1]

#### [METHOD] /api/v1/[resource]

**Purpose:** [What this endpoint does]

**Request:**
```json
{
  "field": "type - description"
}
```

**Response (200):**
```json
{
  "field": "type - description"
}
```

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_INPUT | [When] |
| 404 | NOT_FOUND | [When] |

**Versioning:** [Strategy]

## Component Architecture

[Mermaid component diagram]

### Component Definitions

| Component | Responsibility | Technology | Stories |
|-----------|---------------|------------|---------|
| [Component 1] | [What it does] | [Tech stack] | [S1, S2] |

## Integration Patterns

| Integration | Pattern | Protocol | Rationale |
|-------------|---------|----------|-----------|
| [A -> B] | [Event-driven/Request-response/Batch] | [HTTP/gRPC/AMQP/etc.] | [Why] |

## Dependencies

### Third-Party

| Dependency | Version | Licence | Last Updated | CVEs | Risk | Alternatives |
|-----------|---------|---------|-------------|------|------|-------------|
| [Dep 1] | [Ver] | [Licence] | [Date] | [Count] | [H/M/L] | [Fallback] |

### Internal

| System | Integration Point | Contract | Owner |
|--------|-------------------|----------|-------|
| [System 1] | [How connected] | [API/Event/etc.] | [Team] |

## Architecture Decision Records

### ADR-1: [Decision Title]

**Status:** [Proposed | Accepted | Deprecated | Superseded]
**Context:** [What is the situation]
**Decision:** [What we chose]
**Consequences:** [What follows from this decision]

## Implementation Plan

### Story -> Component Mapping

| Story | Components Affected | Implementation Notes |
|-------|-------------------|---------------------|
| S1 | [Components] | [Key details for engineer] |

### Suggested Implementation Order

1. [Story X] - [Why first - foundational]
2. [Story Y] - [Depends on X]
3. [Story Z] - [Can parallelise with Y]

## Infrastructure Spec

**Environments:** [Dev/Staging/Prod]
**IaC approach:** [Terraform/Pulumi/etc.]
**CI/CD pipeline:** [GitHub Actions/etc.]

## Security Implementation Notes

*From Threat Model - specific implementation guidance:*

- [Security control 1]: implement as [specific approach]
- [Security control 2]: implement as [specific approach]

## Handoff to Engineer (Bea)

**Start with:** [First story to implement]
**Key patterns to follow:** [Coding patterns, conventions]
**Test strategy:** [Unit/Integration/E2E expectations]

## References

[Source citations including all upstream artifacts]
```

---

## Guidelines

**Do:**
- Define every entity, relationship, and cardinality
- Specify complete API contracts with error states
- Document every significant decision as an ADR
- Assess every dependency for risk
- Map every story to implementation components
- Include Mermaid diagrams for data models and architecture
- Be precise enough that an engineer can implement without questions

**Don't:**
- Leave API contracts incomplete (missing error states, versioning)
- Accept dependencies without risk assessment
- Skip the data model
- Produce vague component descriptions
- Omit integration pattern rationale
- Make up information without sources

---

## Empty Section Handling

Every TechnicalDesign.md must include ALL sections. If no data exists:

```markdown
## Infrastructure Spec

*Not yet defined. This section needs input from Oscar (Operations Advisor).*
```

This highlights gaps rather than hiding them.

---

## Section Quick Reference

| Section | Key Question | Owner |
|---------|--------------|-------|
| Overview | What are we designing? | Dylan |
| Data Model | What entities and relationships? | Dylan |
| API Contracts | What are the interfaces? | Dylan |
| Component Architecture | What are the building blocks? | Dylan |
| Integration Patterns | How do components connect? | Dylan |
| Dependencies | What third-party components? | Dylan |
| ADRs | Why these choices? | Dylan |
| Implementation Plan | What order to build? | Dylan |
| Infrastructure Spec | How is it deployed? | Dylan + Oscar |
| Security Notes | How to implement controls? | Dylan + Serena |
| Handoff | What does the engineer need? | Dylan |
| References | Where from? | All |
