---
description: Show review status for a profile (e.g. /analyse-status product)
---

Run the **Analyse** skill status check. Load and follow `~/.claude/skills/Analyse/SKILL.md`.

**User input:** $ARGUMENTS

Parse the arguments:
- First argument = profile name (e.g., `product`)

Read `~/github/mccullonas-kb/_sources/REVIEW-MANIFEST.json` and report:
- How many files reviewed and pending reconcile for this profile
- How many files reconciled for this profile
- How many source files in `~/github/mccullonas-kb/_sources/GoogleDrive/` not yet reviewed for this profile
