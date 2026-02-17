# Product Profile: Anonymization Rules

Rules for anonymizing sensitive content during product intelligence extraction.

---

## Always Anonymize

**Currently disabled.** No anonymization is applied. All content passes through as-is.

To re-enable, uncomment the rules below and remove the "disabled" flag.

<!--
### Client Names
- Replace all client company names with `[Client A]`, `[Client B]`, `[Client C]`, etc.
- Maintain consistency within a single review: same client = same letter
- Cross-file consistency is NOT required (Client A in file1 may be different from Client A in file2)
- Include the mapping in the extraction metadata for internal reference

### Revenue Figures
- Replace specific revenue: "$2.4M ARR" → `[significant ARR]`
- Replace specific deal values: "£150k contract" → `[mid-range contract value]`
- Preserve relative scale: "their largest client" can stay
- Preserve growth indicators: "revenue doubled" can stay

### Pricing Specifics
- Replace exact prices: "£0.03 per quote" → `[per-quote pricing]`
- Preserve pricing model: "per-quote basis" can stay
- Replace discount specifics: "40% discount" → `[significant discount]`

### Individual Names
- Replace named individuals with role: "John Smith" → `[their CTO]`
- Exception: team members names can remain (they're our team)
- Exception: Public figures in public contexts
-->

---

## Preserve (Don't Anonymize)

### Product Names
- project names: Health, HomeLab, etc.
- Third-party product names mentioned generically: Experian, Equifax, etc.

### Industry Terms
- Market segments: "motor insurance", "household"
- Technical terms: "MTA", "quote lake", "enrichment"

### Dates and Timelines
- Keep dates: "launched Q2 2025"
- Keep relative timing: "6 months after integration"

### Aggregate Numbers
- Market size: "UK motor insurance market"
- Non-attributable stats: "90% of insurers"
- Volume indicators: "millions of quotes per month"

### Team Members
- Internal team members can be named
- Their roles and responsibilities can be described

---

## Anonymization in Practice

### During Extraction (Agents)
- Agents flag items needing anonymization in their extraction
- Items marked with `[ANONYMIZE: original → replacement]`
- Pippa (Commercial & Product) is primary anonymization watchdog

### During Reconciliation
- All flagged items are anonymized before writing to Product.md
- Mapping table preserved in REVIEW-MANIFEST.json (not in Product.md)
- Product.md only contains anonymized content

### Edge Cases

**Client mentioned in multiple contexts:**
```
Original: "Acme Insurance uses QI and DI"
Anonymized: "[Client A] uses QI and DI"
(Same letter because same review)
```

**Multiple clients in comparison:**
```
Original: "Acme prefers QI while Beta Corp chose DI"
Anonymized: "[Client A] prefers QI while [Client B] chose DI"
```

**Client in a quote:**
```
Original: Their CEO said "the product transformed our pricing"
Anonymized: [Client A]'s [CEO] said "the product transformed our pricing"
```

---

## Verification

Before reconciliation, verify:
1. No client company names remain in extraction content
2. No specific revenue/deal figures remain
3. No specific pricing numbers remain
4. No individual names remain (except team members)
5. Anonymization mapping is recorded in manifest entry
