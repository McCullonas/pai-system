---
description: Analyse source files with a reviewer profile (e.g. /analyse product ~/github/mccullonas-kb/_sources/GoogleDrive/file.txt or /analyse product ~/github/mccullonas-kb/_sources/GoogleDrive/)
---

Execute via Bash:

```bash
bun ~/.claude/skills/Analyse/Tools/ReviewOrchestrator.ts $ARGUMENTS
```

Report the output to the user. If the exit code is non-zero, explain which files failed and suggest re-running with `--force` for those specific files.
