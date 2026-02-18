# Ops Readiness Template

This template defines the structure for OpsReadiness.md files. Focus on operational readiness: deployment, monitoring, recovery, and support.

---

## Template Structure

```markdown
# Ops Readiness: [Feature/Product Name]

## Deployment Overview

**Product:** [Product name]
**Phase:** [POC | MVP | Release-1]
**Shaped Solution:** [Reference to ShapedSolution.md]
**Date:** [YYYY-MM-DD]
**Reviewer:** Oscar Operations (Operations Advisor)

## Deployment Model

**Strategy:** [Blue-green | Canary | Rolling | Feature flag]
**Target environment:** [AWS/Azure/On-prem/Hybrid]
**Rollback plan:** [How to roll back]
**Deployment frequency:** [Expected cadence]

## Infrastructure Requirements

| Component | Type | Spec | Scaling | Notes |
|-----------|------|------|---------|-------|
| [Component 1] | [Compute/DB/Cache/Queue] | [Size] | [Auto/Manual/Fixed] | |

## Service Levels

| Service | SLI | SLO | SLA (if applicable) |
|---------|-----|-----|---------------------|
| [Service 1] | [What we measure] | [Target] | [Commitment] |

## Monitoring and Observability

### Health Checks

| Endpoint/Check | Type | Frequency | Alert Threshold |
|---------------|------|-----------|-----------------|
| [Check 1] | [HTTP/TCP/Custom] | [Interval] | [When to alert] |

### Metrics

| Metric | Source | Dashboard | Alert Rule |
|--------|--------|-----------|------------|
| [Metric 1] | [Source] | [Where to see] | [When to page] |

### Logging

| Log Stream | Level | Retention | Purpose |
|-----------|-------|-----------|---------|
| [Stream 1] | [Info/Warn/Error] | [Duration] | [What it captures] |

### Tracing

**Distributed tracing:** [Yes/No]
**Trace sampling rate:** [Rate]
**Key traces to instrument:** [List]

## Recovery

| Scenario | RTO | RPO | Recovery Steps |
|----------|-----|-----|----------------|
| [Scenario 1] | [Time] | [Data loss] | [Steps] |

## Support Model

**Primary support:** [Team/Person]
**Escalation path:** [Who to call]
**On-call rotation:** [Schedule]
**Runbook location:** [Path]

## Operational NFRs

*Non-functional requirements for Story Crafter (Suki):*

- NFR-O1: [Operational requirement for stories]
- NFR-O2: [Operational requirement for stories]

## Cost Estimate

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| [Component 1] | [Estimate] | [Assumptions] |
| **Total** | [Sum] | |

## References

[Source citations]
```

---

## Guidelines

**Do:**
- Focus on operational readiness, not feature definition
- Define measurable SLOs with specific targets
- Include concrete recovery procedures
- Specify who supports this and how
- Right-size infrastructure for the actual scale
- Cite the shaped solution and conversation sources

**Don't:**
- Include feature specifications (that's Product.md)
- Include architecture details (that's ShapedSolution.md)
- Gold-plate infrastructure for low-scale systems
- Skip sections - include with placeholder if empty
- Define SLAs without business agreement
- Assume support model without confirming ownership

---

## Empty Section Handling

Every OpsReadiness.md must include ALL sections. If no data exists:

```markdown
## Tracing

*Not yet defined. Distributed tracing requirements need input from engineering.*
```

This highlights gaps rather than hiding them.

---

## Section Quick Reference

| Section | Key Question | Owner |
|---------|--------------|-------|
| Deployment Overview | What and when? | Ops/Engineering |
| Deployment Model | How do we deploy and rollback? | DevOps/Engineering |
| Infrastructure | What do we need to run this? | Engineering/Ops |
| Service Levels | What do we promise? | Product/Engineering |
| Health Checks | How do we know it's alive? | Engineering |
| Metrics | What do we measure? | Engineering/Ops |
| Logging | What do we capture? | Engineering |
| Tracing | Can we follow a request? | Engineering |
| Recovery | How do we bounce back? | Ops/Engineering |
| Support Model | Who's on call? | Engineering/Management |
| Operational NFRs | What stories need writing? | Ops/Product |
| Cost Estimate | What does it cost to run? | Ops/Finance |
