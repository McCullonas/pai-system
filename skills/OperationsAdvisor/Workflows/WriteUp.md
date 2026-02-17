# WriteUp Workflow

Generates ops readiness documentation from conversation.

---

## Trigger

"write it up", "generate ops readiness", "write up the ops doc"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- Infrastructure decisions and constraints
- Deployment model and strategy
- SLO/SLI definitions
- Monitoring and observability requirements
- Health checks defined
- Recovery scenarios and RTO/RPO
- Support model and ownership
- Cost estimates discussed
- Operational NFRs for downstream story crafting

### 2. Identify Products to Update

List all products mentioned in conversation.
Confirm with Andy: "I'll be writing ops readiness for [Product A]. Correct?"

### 3. Load Existing Docs

For each product:
- Load existing OpsReadiness.md if it exists
- Load ShapedSolution.md for cross-reference
- Note what needs updating vs adding

### 4. Generate/Update OpsReadiness.md

Follow `OpsReadinessTemplate.md` structure:

1. **Deployment Overview** - Product, phase, shaped solution reference
2. **Deployment Model** - Strategy, environment, rollback, cadence
3. **Infrastructure Requirements** - Components, specs, scaling
4. **Service Levels** - SLIs, SLOs, SLAs from conversation
5. **Monitoring and Observability** - Health checks, metrics, logging, tracing
6. **Recovery** - Scenarios, RTO, RPO, recovery steps
7. **Support Model** - Ownership, escalation, on-call, runbooks
8. **Operational NFRs** - Requirements ready for story crafting
9. **Cost Estimate** - Component costs and totals
10. **References** - Cite the conversation file

### 5. Write Output File

Write OpsReadiness.md to the product's phase directory:
`~/github/mccullonas-kb/[Product Path]/[Phase]/OpsReadiness.md`

Create the phase directory if it does not exist.

### 6. Add References

At end of OpsReadiness.md:
```markdown
## References

[1] Ops review conversation with Oscar - YYYY-MM-DD
    Path: _sources/Meetings/YYYY/MM/DD/YYYY-MM-DD-Oscar-[Topic].md

[2] Shaped solution reference
    Path: [Product Path]/[Phase]/ShapedSolution.md
```

### 7. Update Conversation Status

In the `reviews.product` frontmatter block:
- Set `status: written_up`
- Set `reviewed_at` to the current ISO-8601 timestamp (e.g. `"2026-02-07T15:30:00Z"`)
- Ensure `routed_to` reflects all products that were actually written up

### 8. Update PIPELINE-INDEX.md

Mark conversation as written_up in index.

### 9. Present Results

Show Andy what was created/updated:
```
Done! I've written the ops readiness for:

**[Product Name]** (OpsReadiness.md)
- Deployment strategy: [strategy]
- SLOs defined: [count]
- Monitoring coverage: [summary]
- NFRs ready for Suki: [count]

Ops readiness written. NFRs ready for Suki's stories.

Want me to show you the full document?
```

---

## Multiple Products

If conversation touched multiple products:
1. Extract relevant ops content for each
2. Write separate OpsReadiness.md per product
3. Ensure no duplication
4. Cross-reference where appropriate

---

## Draft Mode

For experimental or incomplete ops reviews:
- Write to `OpsReadiness-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Ops readiness written. NFRs ready for story crafting.","voice_id":"VR6AewLTigWG4xSOukaG","title":"Oscar"}' \
  > /dev/null 2>&1 &
```

---

### 10. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
📋 PIPELINE STATUS: [Feature/Product Name]
─────────────────────────────────────────
1.  Product Definition (Pippa)      [✅ Complete | ⬜ Not started]
2a. Solution Shaping (Sam)          [✅ Complete | ⬜ Not started]
2b. Security Review (Serena)        [✅ Complete | 🔄 In progress | ⬜ Not started]
2c. Ops Review (Oscar)              [✅ Complete]    ← YOU ARE HERE
3.  Story Breakdown (Suki)          [⬜ Not started]
4.  Technical Design (Dylan)        [⬜ Not started]
5.  Build (Bea)                     [⬜ Not started]
```

3. Check PIPELINE-INDEX for Serena's status and offer next step:
   - If Serena done: "Both ops and security are complete. Next: `/stories` to start story breakdown with Suki."
   - If Serena not done: "Ops done. Serena still needs security review. `/security` to start that, or park and come back."
   - Or "park this" to come back later.
