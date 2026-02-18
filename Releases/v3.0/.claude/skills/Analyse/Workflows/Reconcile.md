# Reconcile Workflow

> **Legacy:** Replaced by `Tools/ReconcileOrchestrator.ts`. This file documents the intended workflow logic and is kept as reference. The TypeScript orchestrator implements this behavior deterministically.

Merge pending extractions from REVIEW-MANIFEST.json into target Product.md files.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running the Reconcile workflow in the Analyse skill to merge extractions into product documentation"}' \
  > /dev/null 2>&1 &
```

Running the **Reconcile** workflow in the **Analyse** skill to merge extractions into product documentation...

## Parameters

- **profile** (required): Profile name (e.g., `product`)

## Prerequisites

- `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` must exist with entries
- Profile-specific Template.md defines reconciliation rules
- Load `Profiles/{Profile}/Template.md` for reconciliation rules
- Load `Profiles/{Profile}/AnonymizationRules.md` for final verification

## Execution

### Step 1: Load Pending Entries

Read `REVIEW-MANIFEST.json` and filter for:
- `profile` matches requested profile
- `status` is `pending_reconcile`

If no pending entries found:
```markdown
No pending reconciliations for profile: [profile].
All extractions have been reconciled.
```
Exit.

### Step 2: Report Plan

```markdown
## Reconcile Plan

**Profile:** [profile]
**Pending entries:** [count]

Entries to reconcile:
1. [source_file] → [routed_to] (Confidence: [level])
2. [source_file] → [routed_to] (Confidence: [level])
3. ...

Proceeding with reconciliation...
```

### Step 3: Process Each Entry

For each pending entry, in order:

#### 3a: Load Target Product.md

For each product in the entry's `routed_to` array:
1. Determine Product.md path: `~/github/mccullonas-kb/{routed_to}/Product.md`
2. Read current Product.md content
3. If Product.md doesn't exist, create from ProductTemplate.md structure

#### 3b: Merge Extractions (Smart Deduplication)

For each section in the extraction that has content:

**Important:** Existing Product.md content is NOT treated as canonical. It may have come from earlier, less rigorous processes. Incoming extractions from the Analyse skill have been through a structured multi-agent review and should be treated with equal or greater weight. The goal is to accumulate all intelligence — curation happens later in a separate review phase with the user.

**Confidence-level gating (based on extraction quality, not deference to existing content):**

1. **High confidence extractions** → Merge using dedup rules below
2. **Medium confidence extractions** → Merge with `*[Inferred from source]*` prefix
3. **Low confidence extractions** → Don't auto-merge; add to `## Pending Review` section at bottom of Product.md

**Smart deduplication rules:**

Before appending, read the existing section content and compare against the incoming extraction at the **fact level**:

1. **Same fact, already stated** → Don't repeat it. Instead, add a corroborating source citation to the existing statement.
   ```markdown
   Real-time pricing enrichment at point of quote.
   *Sources: SalesPresentation.txt (2026-02-01), ProductOverview.txt (2026-02-07)*
   ```

2. **Same topic, but adds new detail or a different angle** → Append only the novel parts, not the whole extraction. Cite the source.
   ```markdown
   Real-time pricing enrichment at point of quote.
   *Sources: SalesPresentation.txt (2026-02-01)*

   Supports both personal and commercial lines, with separate enrichment models per line of business.
   *Source: TechnicalSpec.txt (2026-02-07)*
   ```

3. **Genuinely new information** → Append with source citation as normal.

4. **When uncertain whether something is a duplicate** → Include it. Err towards completeness over conciseness. The Curate phase is where the user will trim.

**Provenance markers:**

Add HTML comments to everything reconcile writes so the Curate phase can distinguish automated extractions from user contributions:
```markdown
<!-- source: analyse/product/2026-02-07 -->
### [New Feature Name]
[Feature description from extraction]
*Source: [source_file] ([date])*
```

**Reference addition:**

```markdown
## References

[Existing references preserved]

[N] [Source description]
    Path: _sources/GoogleDrive/[filename]
    Reviewed: [date]
    Profile: [profile]
```

#### 3c: Handle Orphans (Tiered Routing)

Route each orphan to the correct orphan file based on entity confidence (see `~/github/mccullonas-kb/PRODUCTS.md` for full rules):

**Determine the tier:**
2. If a known entity prefix is found → use `~/github/mccullonas-kb/{Entity}/Orphans.md`
3. If `routed_to` is empty or no entity can be determined → use `~/github/mccullonas-kb/ORPHANED-TOPICS.md` (root)

**Write the orphan entry:**
1. Read the target orphan file (create with standard header if it doesn't exist)
2. Add orphan entry under `## Pending Review`:

```markdown
### [Topic Name]
**Source:** `_sources/GoogleDrive/[filename]`
**Added:** [date]
**Status:** pending_review
**Why orphan:** [explanation from extraction]
**Suggested action:** [from extraction]
**Extraction context:**
> [relevant quote]
```

3. Update statistics at bottom of the orphan file

#### 3d: Final Anonymization Check

Before writing any Product.md:
1. Scan merged content against AnonymizationRules.md
2. Verify no client names slipped through
3. Verify no specific figures remain
4. If violations found, anonymize and log

#### 3e: Write Changes

1. Write updated Product.md
2. Update manifest entry:
   ```json
   {
     "status": "reconciled",
     "reconciled_at": "2026-02-06T15:00:00Z"
   }
   ```
3. Update source file frontmatter:
   ```yaml
   reviews:
     product:
       status: reconciled
       reconciled_at: 2026-02-06T15:00:00Z
   ```

### Step 4: Progress Reporting

After each entry is reconciled:
```markdown
✅ [source_file] → [product(s)] reconciled
   - Sections updated: Overview, Features, Clients
   - Orphans added: 1
```

### Step 5: Reconcile Summary

```markdown
## Reconcile Complete

**Profile:** [profile]
**Entries reconciled:** [count]
**Products updated:** [list of Product.md files touched]
**Orphans added:** [count]
**Low-confidence items flagged:** [count] (need human review)

### Changes by Product

**HomeLab/Product.md:**
- Overview: Updated with new context
- Features: Added 2 new features
- Clients: Added [Client A] reference

**HomeAutomation/Product.md:**
- Dependencies: Updated connection to QI

### Items Needing Review
[List of low-confidence extractions not auto-merged]
```

## Error Handling

- If a Product.md write fails, mark entry as `failed` in manifest
- Continue with remaining entries
- Report all failures in summary
- Failed entries can be retried with another `/reconcile` run

## Conflict Handling

Existing Product.md content may be inaccurate — it has not been through formal review. When extraction content contradicts existing content:

1. **Include both** — don't suppress either version
2. **Add the incoming content normally** with its source citation
3. **Flag the contradiction** for the Curate phase:
   ```markdown
   <!-- CONFLICT: incoming extraction differs from existing content above -->
   [New information with source citation]
   ```
4. Report conflicts in reconcile summary with section and product path

Contradictions are resolved during the Curate phase (user + Pippa review), not during reconcile.

## Curate Phase (Future)

After all source files have been processed and reconciled, a separate Curate workflow will:
- Walk through each Product.md with the user and Pippa
- Present all content with provenance (automated vs user-contributed)
- Deduplicate, resolve contradictions, remove inaccuracies
- The user's judgement is the final authority
- Output: clean, canonical Product.md files that become the source of truth

## Done

Reconciliation complete. Product.md files updated with extracted intelligence. Manifest entries marked as reconciled.
