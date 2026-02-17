# Threat Model Template

This template defines the structure for ThreatModel.md files. Used by Serena when writing up security reviews.

---

## Template Structure

```markdown
# Threat Model: [Feature/Product Name]

## System Overview

**Product:** [Product name]
**Phase:** [POC | MVP | Release-1]
**Shaped Solution:** [Reference to ShapedSolution.md]
**Date:** [YYYY-MM-DD]
**Reviewer:** Serena Security (Security Advisor)

## Assets

*What are we protecting?*

| Asset | Classification | Storage | Notes |
|-------|---------------|---------|-------|
| [Asset 1] | [PII/Confidential/Internal/Public] | [Where stored] | |

## Trust Boundaries

*Where do trust levels change?*

[Mermaid diagram showing trust boundaries, data flows, and components]

## STRIDE Analysis

### Per Component

| Component | S | T | R | I | D | E | Priority Threats |
|-----------|---|---|---|---|---|---|-----------------|
| [Component 1] | [Y/N] | [Y/N] | [Y/N] | [Y/N] | [Y/N] | [Y/N] | [Top threats] |

### Threat Catalogue

| ID | Category | Threat | Component | Risk (DREAD) | Mitigation | Status |
|----|----------|--------|-----------|-------------|------------|--------|
| T1 | [STRIDE cat] | [Description] | [Component] | [Score] | [Control] | [Open/Mitigated/Accepted] |

## DPIA Assessment

*Required if PII is processed*

**Data subjects:** [Who]
**Data categories:** [What PII]
**Processing purpose:** [Why]
**Legal basis:** [GDPR basis]
**Necessity and proportionality:** [Justification]
**Risks to data subjects:** [Assessment]

## AI Safety Review

*Required if AI/ML components are present*

| OWASP LLM Risk | Applicable? | Assessment | Mitigation |
|-----------------|------------|------------|------------|
| Prompt Injection | [Y/N] | [Details] | [Controls] |
| Insecure Output Handling | [Y/N] | [Details] | [Controls] |
| Training Data Poisoning | [Y/N] | [Details] | [Controls] |
| Model Denial of Service | [Y/N] | [Details] | [Controls] |
| Supply Chain Vulnerabilities | [Y/N] | [Details] | [Controls] |
| Sensitive Information Disclosure | [Y/N] | [Details] | [Controls] |
| Insecure Plugin Design | [Y/N] | [Details] | [Controls] |
| Excessive Agency | [Y/N] | [Details] | [Controls] |
| Overreliance | [Y/N] | [Details] | [Controls] |
| Model Theft | [Y/N] | [Details] | [Controls] |

## Cryptographic Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Data at rest | [e.g. AES-256] | [How] |
| Data in transit | [e.g. TLS 1.3] | [How] |
| Key management | [Standard] | [Approach] |

## Security NFRs

*Non-functional requirements for Story Crafter (Suki):*

- NFR-S1: [Security requirement for stories]
- NFR-S2: [Security requirement for stories]

## SDL Compliance Checklist

| SDL Practice | Status | Notes |
|--------------|--------|-------|
| Standards & Governance | [Compliant/Gap/N/A] | |
| Proven Security Features | [Compliant/Gap/N/A] | |
| Threat Modelling | [Compliant/Gap/N/A] | |
| Cryptography | [Compliant/Gap/N/A] | |

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
- Complete STRIDE analysis for every component
- DREAD-score all identified threats
- Include DPIA section if any PII is processed
- Include AI Safety Review if any AI/ML components exist
- List all cryptographic requirements
- Generate Security NFRs for downstream story crafting
- Check SDL compliance for all four practices
- Cite all sources including conversation files

**Don't:**
- Skip components in STRIDE analysis
- Accept threats without mitigation plans or explicit risk acceptance
- Omit the DPIA section -- include it with "N/A - No PII processed" if not applicable
- Leave the AI Safety Review blank -- mark "N/A - No AI components" if not applicable
- Make up DREAD scores without discussion

---

## Empty Section Handling

Every ThreatModel.md must include ALL sections. If not applicable:

```markdown
## AI Safety Review

*N/A - No AI/ML components in this feature.*
```

This highlights completeness rather than hiding gaps.

---

## Section Quick Reference

| Section | Key Question | Framework |
|---------|--------------|-----------|
| Assets | What are we protecting? | Classification |
| Trust Boundaries | Where do trust levels change? | Architecture |
| STRIDE Analysis | What threats exist per component? | STRIDE |
| Threat Catalogue | What's the full threat list? | STRIDE + DREAD |
| DPIA Assessment | Is PII processing safe and lawful? | DPIA / GDPR |
| AI Safety Review | Are AI components secure? | OWASP LLM Top 10 |
| Cryptographic Reqs | How is data protected? | SDL Practice 4 |
| Security NFRs | What must stories implement? | SDL |
| SDL Compliance | Are we framework-compliant? | SDL Practices 1-4 |
