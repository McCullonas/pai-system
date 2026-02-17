---
description: Merge pending extractions into target documents (e.g. /reconcile product)
---

Execute via Bash:

```bash
bun ~/.claude/skills/Analyse/Tools/ReconcileOrchestrator.ts $ARGUMENTS
```

Report the output to the user. If the exit code is non-zero, explain which entries failed.
