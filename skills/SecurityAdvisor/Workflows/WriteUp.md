# WriteUp Workflow

Generates threat model documentation (and optionally DPIA) from conversation.

---

## Trigger

"write it up", "generate threat model", "write up the threat model"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- System components and data flows discussed
- Trust boundaries identified
- STRIDE analysis results per component
- DREAD scores for identified threats
- PII touchpoints and data subjects
- AI/ML component risks
- Cryptographic requirements discussed
- SDL compliance gaps noted
- Security NFRs agreed

### 2. Identify Output Artifacts

Determine what needs to be generated:

**Always:**
- `ThreatModel.md` - Following ThreatModelTemplate.md

**If PII processing was discussed:**
- `DPIA.md` - Following DPIATemplate.md (standalone, if warranted)

Confirm with Andy: "I'll generate a threat model for [Product]. DPIA needed too? [Yes/No based on discussion]"

### 3. Load Existing Docs

For each product:
- Load existing ThreatModel.md if it exists (update vs create)
- Load existing DPIA.md if it exists
- Load ShapedSolution.md for cross-referencing

### 4. Determine Output Location

Output artifacts go to the product's phase directory:
`~/github/mccullonas-kb/[Product Path]/[Phase]/ThreatModel.md`
`~/github/mccullonas-kb/[Product Path]/[Phase]/DPIA.md`

For example:
- `~/github/mccullonas-kb/McCullonas/Projects/Health/Release-1/ThreatModel.md`

Create the phase directory if it does not exist.

### 5. Generate ThreatModel.md

Follow `ThreatModelTemplate.md` structure:

1. **System Overview** - From shaped solution and conversation
2. **Assets** - Data and components requiring protection
3. **Trust Boundaries** - With Mermaid diagram
4. **STRIDE Analysis** - Per-component table and threat catalogue
5. **DPIA Assessment** - Summary (or reference to standalone DPIA.md)
6. **AI Safety Review** - OWASP LLM Top 10 assessment
7. **Cryptographic Requirements** - Encryption standards
8. **Security NFRs** - For downstream story crafting (Suki)
9. **SDL Compliance Checklist** - Practices 1-4
10. **References** - Cite conversation file, Microsoft SDL

### 6. Generate DPIA.md (If Required)

Follow `DPIATemplate.md` structure:

1. **Project Overview** - Context and scope
2. **Data Processing Description** - What, who, why, legal basis
3. **Data Flow** - With Mermaid diagram highlighting PII
4. **Necessity and Proportionality** - Minimisation assessment
5. **Risks to Data Subjects** - Scored risk table
6. **Data Subject Rights** - Implementation status
7. **Consultation** - DPO and data subject consultation
8. **Decision** - Proceed / conditional / reject
9. **Review Schedule** - Next review date and triggers
10. **References** - Cite conversation and policies

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
Threat model written. Here's what I've produced:

**[Product Name]** (ThreatModel.md)
- [N] threats identified across [M] components
- [X] high-priority threats (DREAD > 7)
- [Y] security NFRs ready for Suki's stories
- SDL compliance: [status summary]

**[Product Name]** (DPIA.md) [if generated]
- [N] PII touchpoints mapped
- Decision: [Proceed/Conditional/Reject]
- Next review: [Date]

Security NFRs ready for Suki's stories. Want me to show you the details?
```

---

## Multiple Products

If conversation touched multiple products:
1. Extract relevant threats for each
2. Generate separate ThreatModel.md per product
3. Cross-reference shared components
4. Ensure no duplication of threat entries

---

## Draft Mode

For preliminary or experimental threat models:
- Write to `ThreatModel-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Threat model written. Security NFRs ready for stories.","voice_id":"ErXwobaYiN019PkySvjV","title":"Serena"}' \
  > /dev/null 2>&1 &
```

---

### 10. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
PIPELINE STATUS: [Feature/Product Name]

1.  Product Definition (Pippa)      [Complete | Not started]
2a. Solution Shaping (Sam)          [Complete | Not started]
2b. Security Review (Serena)        [Complete]    <- YOU ARE HERE
2c. Ops Review (Oscar)              [Complete | In progress | Not started]
3.  Story Breakdown (Suki)          [Not started]
4.  Technical Design (Dylan)        [Not started]
5.  Build (Bea)                     [Not started]
```

3. Check PIPELINE-INDEX for Oscar's status and offer next step:
   - If Oscar done: "Both security and ops are complete. Next: `/stories` to start story breakdown with Suki."
   - If Oscar not done: "Security done. Oscar still needs ops review. `/ops` to start that, or park and come back."
   - Or "park this" to come back later.
