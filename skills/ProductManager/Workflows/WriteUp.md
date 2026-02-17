# WriteUp Workflow

Generates product documentation from conversation.

---

## Trigger

"write it up", "generate docs", "write up the product doc"

---

## Execution Steps

### 1. Review Conversation

Read the full conversation file and extract:
- Key facts about the product
- Features discussed
- Limitations mentioned
- Corrections made ("X belongs to Y not Z")
- Use cases described
- Client information

### 2. Identify Products to Update

List all products mentioned in conversation.
Confirm with {PRINCIPAL.NAME}: "I'll be updating docs for [Product A] and [Product B]. Correct?"

### 3. Load Existing Docs

For each product:
- Load existing Product.md if it exists
- Note what needs updating vs adding

### 4. Generate/Update Product.md

Follow `ProductTemplate.md` structure:

1. **Overview** - Synthesize from conversation
2. **Value Proposition** - From 5 Whys discussions
3. **Features** - From feature discussions
4. **Limitations** - From constraints discussed
5. **Use Cases** - From scenarios discussed
6. **Clients** - From client mentions
7. **References** - Cite the conversation file

### 5. Add References

At end of Product.md:
```markdown
## References

[1] Conversation with Pippa - 2026-02-06
    Path: _sources/Meetings/2026-02-06-Pippa-Infrastructure.md
```

### 6. Update Conversation Status

In the `reviews.product` frontmatter block:
- Set `status: written_up`
- Set `reviewed_at` to the current ISO-8601 timestamp (e.g. `"2026-02-07T15:30:00Z"`)
- Ensure `routed_to` reflects all products that were actually written up

### 7. Update PRODUCT-INDEX.md

Mark conversation as written_up in index. Preserve the participant field (`{PRINCIPAL.NAME}`) in the entry.

### 8. Present Results

Show {PRINCIPAL.NAME} what was created/updated:
```
Done! I've updated:

**Infrastructure** (Product.md)
- Added 3 features from our discussion
- Clarified 2 limitations
- Moved Quote Lake to HomeLab

**HomeLab** (Product.md)
- Added Quote Lake feature (moved from PI)

Want me to show you the changes?
```

---

## Multiple Products

If conversation touched multiple products:
1. Extract relevant content for each
2. Update each Product.md
3. Ensure no duplication
4. Cross-reference where appropriate

---

## Draft Mode

For template changes or experimental docs:
- Write to `[Name]-draft.md` instead
- Andy reviews before making live

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Documentation complete. Ready for review.","voice_id":"XrExE9yKIg1WjnnlVkGX","title":"Pippa"}' \
  > /dev/null 2>&1 &
```

### 9. Pipeline Handoff

After completing the write-up, show the user where they are in the pipeline:

1. Read PIPELINE-INDEX.md to check which stages have been completed for this feature
2. Display the pipeline status:

```
PIPELINE STATUS: [Feature/Product Name]
---------------------------------------------
1.  Product Definition (Pippa)      [Complete]       <-- YOU ARE HERE
2a. Solution Shaping (Sam)          [Not started]
2b. Security Review (Serena)        [Not started]
2c. Ops Review (Oscar)              [Not started]
3.  Story Breakdown (Suki)          [Not started]
4.  Technical Design (Dylan)        [Not started]
5.  Build (Bea)                     [Not started]
```

3. Offer next step:
```
Product definition complete. Next: `/shape` to start solution shaping with Sam.
Or "park this" to come back later.
```
