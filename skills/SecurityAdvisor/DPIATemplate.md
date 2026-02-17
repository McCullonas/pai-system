# DPIA Template

This template defines the structure for standalone DPIA documents. Used by Serena when a full Data Protection Impact Assessment is required.

---

## Template Structure

```markdown
# Data Protection Impact Assessment: [Feature/Product Name]

## Project Overview

**Product:** [Name]
**Phase:** [POC | MVP | Release-1]
**Date:** [YYYY-MM-DD]
**Assessor:** Serena Security (Security Advisor)

## Data Processing Description

**What data is processed:** [Description of all personal data involved]
**Data subjects:** [Categories of people whose data is processed]
**Purpose of processing:** [Why this data is being processed]
**Legal basis:** [Consent | Legitimate Interest | Contract | Legal Obligation]

## Data Flow

[Mermaid diagram of data flow with PII touchpoints highlighted]

### PII Touchpoints

| Touchpoint | Data Category | Action | Storage | Retention |
|-----------|---------------|--------|---------|-----------|
| [Point 1] | [PII type] | [Collect/Process/Store/Transfer] | [Where] | [How long] |

## Necessity and Proportionality

**Is this processing necessary?** [Assessment - could the purpose be achieved without this data?]
**Is the scope proportionate?** [Assessment - is only the minimum data collected?]
**Could the same outcome be achieved with less data?** [Assessment - data minimisation check]

## Risks to Data Subjects

| Risk | Likelihood | Severity | Overall | Mitigation |
|------|-----------|----------|---------|------------|
| Unauthorised access to personal data | [H/M/L] | [H/M/L] | [H/M/L] | [Control] |
| Data breach leading to identity theft | [H/M/L] | [H/M/L] | [H/M/L] | [Control] |
| Profiling without awareness | [H/M/L] | [H/M/L] | [H/M/L] | [Control] |
| Cross-border data transfer risks | [H/M/L] | [H/M/L] | [H/M/L] | [Control] |
| Excessive data retention | [H/M/L] | [H/M/L] | [H/M/L] | [Control] |
| [Additional risks as identified] | | | | |

## Data Subject Rights

| Right | Supported? | Implementation |
|-------|-----------|----------------|
| Right of access | [Yes/No/Partial] | [How] |
| Right to rectification | [Yes/No/Partial] | [How] |
| Right to erasure | [Yes/No/Partial] | [How] |
| Right to restrict processing | [Yes/No/Partial] | [How] |
| Right to data portability | [Yes/No/Partial] | [How] |
| Right to object | [Yes/No/Partial] | [How] |

## Consultation

**Data subjects consulted?** [Yes/No - if no, justification]
**DPO consulted?** [Yes/No - if no, when will this happen]
**Supervisory authority consulted?** [Yes/No - required if high residual risk]

## Decision

**Proceed?** [Yes | Yes with conditions | No]
**Conditions:** [List of conditions that must be met before processing begins]
**Residual risk level:** [High/Medium/Low - after mitigations applied]

## Review Schedule

**Next review:** [Date - typically 12 months or on significant change]
**Trigger for re-assessment:** [What changes would require a new DPIA]

## Approvals

| Role | Name | Date | Decision |
|------|------|------|----------|
| Security Advisor | Serena Security | [Date] | [Approve/Reject/Conditional] |
| DPO | [Name] | [Date] | [Approve/Reject/Conditional] |
| Product Owner | [Name] | [Date] | [Acknowledge] |

## References

[1] Microsoft Secure Development Lifecycle
    Path: _sources/Policies/Microsoft-SDL.md

[2] Microsoft SDL Practices 2026
    Path: _sources/Policies/Microsoft-SDL-Practices-2026.md

[3] Security conversation with Serena - [Date]
    Path: _sources/Meetings/[path to conversation file]
```

---

## Guidelines

**Do:**
- Map every PII touchpoint in the data flow
- Assess all data subject rights
- Score risks with both likelihood and severity
- Identify specific mitigations for each risk
- Set a review schedule
- Cite legal basis precisely

**Don't:**
- Skip the necessity and proportionality assessment
- Accept vague legal bases ("we probably have consent")
- Leave risks without mitigations or explicit acceptance
- Omit the consultation section
- Forget to set review triggers

---

## When a Standalone DPIA Is Needed

A standalone DPIA document (separate from ThreatModel.md) is needed when:

1. Processing involves systematic profiling at scale
2. New technology is applied to personal data
3. Automated decision-making has legal or similar significant effects
4. Large-scale processing of special category data (health, biometrics, etc.)
5. The DPO or supervisory authority specifically requests one

For simpler cases, the DPIA Assessment section within ThreatModel.md is sufficient.
