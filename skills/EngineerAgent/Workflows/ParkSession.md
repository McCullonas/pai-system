# ParkSession Workflow

Pauses build session for later resumption.

---

## Trigger

"park this", "park session", "pause this"

---

## Execution Steps

### 1. Summarize Session

Bea provides a build-specific summary:
```
Here's where we are:

**Stories completed:**
- [Story 1] -- all ACs met, tests passing
- [Story 2] -- all ACs met, tests passing

**Stories in progress:**
- [Story 3] -- 2/4 ACs implemented, tests passing for those 2

**Tests status:**
- [N] tests passing, [M] tests failing
- Failing: [brief description of what's failing and why]

**Blockers:**
- [Any blockers preventing progress]

**Tech debt filed:**
- [TD-1] [Description]
```

### 2. Update Conversation File

Append summary to end of file:
```markdown
---

## Session Parked (HH:MM)

**Stories completed:**
- [List with AC/test evidence]

**Stories in progress:**
- [List with progress notes]

**Tests status:** [N] passing, [M] failing

**Blockers:**
- [List]

**Tech debt filed:**
- [List]

**Next steps:**
- [What to do when resuming]
```

### 3. Update Header Status

In the `reviews.product` frontmatter block, change `status: active` to `status: parked`.

### 4. Update PIPELINE-INDEX.md

Mark this session as parked in the index.

### 5. Confirm Exit

Bea confirms:
```
Build session parked. Here's where we are: [N] stories done, [M] in progress,
[P] tests passing. I'll remember where we left off.
```

---

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message":"Build session parked. See you next time.","voice_id":"EXAVITQu4vr4xnSDxMaL","title":"Bea"}' \
  > /dev/null 2>&1 &
```
