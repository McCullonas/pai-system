# Product Documentation Template

This template defines the structure for Product.md files. Focus on "what" (product definition), not "how" (implementation).

---

## Template Structure

```markdown
# [Product Name]

## Overview

*What is this product? What problem does it solve?*

2-3 paragraphs in plain language. Understandable by someone with no prior context. Include a one-liner that captures the essence.

## Status

*Where is this product in its lifecycle?*

One of: **GA** | **Beta** | **Pilot** | **Planned**

Brief context if needed (e.g., "GA since Q2 2025" or "Pilot with 3 clients").

## Target Users

*Who specifically is this product for?*

Be precise - not just "insurers" but which roles, which segments:
- Primary users (who interacts daily)
- Buyers (who makes the purchase decision)
- Beneficiaries (who gets value even if they don't touch it directly)

## Value Proposition

*Why does this product exist? What value does it deliver?*

The business case - what outcomes do clients achieve? Quantify where possible.

## Differentiators

*What makes this product different from alternatives?*

Why would someone choose this over:
- Doing nothing
- Building in-house
- Competitor offerings

What's unique about our approach?

## Features

*What can users do?*

Structured list of capabilities:

**[Feature Name]**
What it does, how it works from a user perspective.

**[Feature Name]**
What it does, how it works from a user perspective.

## Limitations

*What can't users do? What are the boundaries?*

Important constraints users should understand:
- Data limitations
- Scope boundaries
- Known gaps

*If no limitations documented: "No limitations documented yet. This section needs input from product/engineering."*

## Dependencies

*How does this product connect to others?*

- **Requires:** Products/services this depends on
- **Enhances:** Products that benefit from this one
- **Bundles with:** Common combinations

## Commercial Model

*How is this product sold?*

- Pricing structure (per-quote, subscription, etc.)
- Packaging (standalone, bundled, add-on)
- Typical deal structure

*If commercially sensitive, note "See Sales for current pricing" and describe structure only.*

## Use Cases

*How is the product typically used?*

Real-world scenarios showing how clients apply the product:
- Use case 1
- Use case 2
- Use case 3

## Clients

*Who uses this product?*

### Active
[Client implementations with relevant context]

### Pipeline
[Prospects and deals in progress]

## References

*Source materials cited in this document*

[1] Description of source
    Path: _sources/...

[2] Description of source
    URL: https://...
```

---

## Guidelines

**Do:**
- Focus on WHAT, not HOW
- Write for someone with no context
- Include all sections (flag empty ones)
- Cite sources with footnotes
- Use plain language
- Be specific about users and value

**Don't:**
- Include technical architecture (that's ARCHITECTURE.md)
- Include implementation details (that's DESIGN.md)
- Make up information without sources
- Skip sections - include with placeholder if empty
- Say "insurers" when you mean "underwriting managers at mid-tier carriers"

---

## Empty Section Handling

Every Product.md must include ALL sections. If no data exists:

```markdown
## Differentiators

*Not yet documented. This section needs input from product/sales.*
```

This highlights gaps rather than hiding them.

---

## Section Quick Reference

| Section | Key Question | Owner |
|---------|--------------|-------|
| Overview | What is it? | Product |
| Status | Where in lifecycle? | Product |
| Target Users | Who specifically? | Product/Sales |
| Value Proposition | Why buy it? | Product/Sales |
| Differentiators | Why us? | Product/Sales |
| Features | What can it do? | Product/Engineering |
| Limitations | What can't it do? | Engineering |
| Dependencies | What connects? | Product/Engineering |
| Commercial Model | How sold? | Sales |
| Use Cases | How used? | Product/CS |
| Clients | Who uses it? | Sales/CS |
| References | Where from? | All |
