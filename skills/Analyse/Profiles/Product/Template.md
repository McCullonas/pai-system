# Product Profile: Extraction Template

Maps expert agent extractions to ProductTemplate.md sections. This defines how analysis results are structured and where they route during reconciliation.

---

## Section Mapping

Each ProductTemplate.md section has one or more owning agents:

| ProductTemplate Section | Primary Agent | Supporting Agent(s) |
|------------------------|---------------|---------------------|
| Overview | Finn | Vera |
| Status | Pippa | - |
| Target Users | Vera | Pippa |
| Value Proposition | Vera | - |
| Differentiators | Vera | Finn |
| Features | Finn | - |
| Limitations | Finn | - |
| Dependencies | Finn | - |
| Commercial Model | Pippa | - |
| Use Cases | Vera | - |
| Clients | Pippa | - |
| References | Pippa | Finn, Vera |

---

## Extraction Output Structure

After 3-round review, the final extraction for a file should be structured as:

```json
{
  "source_file": "_sources/GoogleDrive/filename.txt",
  "profile": "product",
  "mode": "full",
  "reviewed_at": "2026-02-06T14:30:00Z",
  "status": "pending_reconcile",
  "reconciled_at": null,
  "routed_to": ["McCullonas/Projects/HomeLab"],
  "confidence": "high",
  "extractions": {
    "overview": {
      "agent": "Finn",
      "content": "...",
      "confidence": "high"
    },
    "status": {
      "agent": "Pippa",
      "content": "...",
      "confidence": "medium"
    },
    "target_users": {
      "agent": "Vera",
      "content": "...",
      "confidence": "high"
    },
    "value_proposition": {
      "agent": "Vera",
      "content": "...",
      "confidence": "high"
    },
    "differentiators": {
      "agent": "Vera",
      "content": "...",
      "confidence": "medium"
    },
    "features": {
      "agent": "Finn",
      "content": "...",
      "confidence": "high"
    },
    "limitations": {
      "agent": "Finn",
      "content": "...",
      "confidence": "low"
    },
    "dependencies": {
      "agent": "Finn",
      "content": "...",
      "confidence": "high"
    },
    "commercial_model": {
      "agent": "Pippa",
      "content": "...",
      "confidence": "medium"
    },
    "use_cases": {
      "agent": "Vera",
      "content": "...",
      "confidence": "high"
    },
    "clients": {
      "agent": "Pippa",
      "content": "...",
      "anonymized": true,
      "confidence": "high"
    },
    "references": {
      "agent": "Pippa",
      "content": "...",
      "confidence": "high"
    }
  },
  "orphans": [],
  "anonymizations_applied": [],
  "transcript": "..."
}
```

---

### Schema Constraints (STRICT)

- **Top-level keys:** exactly as shown above (`source_file`, `profile`, `mode`, `reviewed_at`, `status`, `reconciled_at`, `routed_to`, `confidence`, `extractions`, `orphans`, `anonymizations_applied`, `transcript`). No additions.
- **Each extraction section:** exactly `{agent, content, confidence}` — plus `anonymized` for `clients` only. No other keys.
- **`content` values:** always flat strings (markdown formatting OK). Never nested objects or arrays.
- **Orphans:** `{topic, description, suggested_action, notes}` — exact keys, no extras. `suggested_action` must be one of: `create_product`, `expand_existing`, `needs_investigation`.
- **Anonymizations:** `{original, replacement, type}` — exact keys, no extras. `type` must be one of: `client`, `financial`, `pricing`, `individual`.

---

## Routing Rules

### Product Identification

Use `~/github/mccullonas-kb/PRODUCTS.md` as the routing reference.

**Known products:**
- `McCullonas/Projects/Health/`
- `McCullonas/Projects/HomeAutomation/`
- `McCullonas/Projects/HomeLab/`
- `McCullonas/Projects/Infrastructure/`
- `McCullonas/Projects/Marvin/`
- `McCullonas/Projects/PantryTracking/`
- `McCullonas/Projects/TelegramInterface/`

### Multi-Product Content

When a source file covers multiple products:
1. Create separate extraction entries per product
2. Each entry references the same source file
3. Each entry contains only the sections relevant to that product
4. The `routed_to` array lists all target products

### Orphan Handling

When content doesn't fit known products:
1. Add to `orphans` array in extraction
2. Include suggested action: `create_product`, `expand_existing`, `needs_investigation`
3. During reconcile, route to the correct orphan file using **tiered orphan routing** (see `~/github/mccullonas-kb/PRODUCTS.md`):
   - If the entity is known (e.g. content is clearly Inform-related) → `~/github/mccullonas-kb/{Entity}/Orphans.md`
   - If the entity is unknown → `~/github/mccullonas-kb/ORPHANED-TOPICS.md` (root level)

---

## Reconciliation Rules

When merging extractions into Product.md:

**Existing content is not canonical.** It may have come from earlier, less rigorous processes. Incoming Analyse extractions have been through structured multi-agent review and carry equal or greater weight. Curation happens later with the user.

**Smart deduplication (fact-level):**
- Before appending, compare incoming content against existing section content
- Same fact already stated → add corroborating source citation, don't repeat
- Same topic but new detail → append only the novel parts with source citation
- Genuinely new → append with source citation
- Uncertain if duplicate → include it (err towards completeness)

**Conflict resolution:**
- Include both versions — don't suppress either
- Flag contradictions with `<!-- CONFLICT -->` comment for Curate phase
- Contradictions are resolved by the user during Curate, not during Reconcile

**Provenance markers:**
- Add `<!-- source: analyse/product/YYYY-MM-DD -->` before all reconcile-written content
- This lets the Curate phase distinguish automated extractions from user contributions

**Reference format:**
```markdown
## References

[N] Source description
    Path: _sources/GoogleDrive/filename.txt
    Reviewed: 2026-02-06
    Profile: product
```

**Empty sections:**
- Only populate sections where extraction has content
- Don't add placeholder text for sections with no data
- Leave existing placeholder text if no new data

---

## Confidence Levels

| Level | Meaning | Reconcile Behavior |
|-------|---------|-------------------|
| **High** | Direct statements in source, clear evidence | Auto-merge into Product.md |
| **Medium** | Reasonable inference, partial evidence | Merge with "[Inferred]" flag |
| **Low** | Speculation, weak signals | Add to extraction but don't auto-merge; flag for review |
