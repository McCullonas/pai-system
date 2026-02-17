# DryRun Workflow

**Trigger:** "dry run", "what would change", "preview migration", "diff only"

---

## Purpose

Run the diff and categorisation steps of the Migrate workflow WITHOUT building anything. Shows what would be ported, replaced, and skipped — so the user can review before committing to a full migration.

---

## Process

1. Run all pre-flight checks from Migrate workflow
2. Run Step 1 (Identify the Changeset) in full
3. Categorise all files
4. Show what the target version adds that we don't have (new hooks, skills, agents)
5. Show settings.json schema differences

**Do NOT:**
- Create the staging directory
- Copy any files
- Build the merged installation

---

## Output

Present the results as a table:

```markdown
## PAI Migration Dry Run: v{CURRENT} -> v{TARGET}

### Our Changeset (what we've customised)
| Category | Files | Example |
|----------|-------|---------|
| USER | X | DAIDENTITY.md, AISTEERINGRULES.md |
| CustomSkill | X (N skills) | Analyse, RailAdvisor, etc. |
| ... | ... | ... |

### What v{TARGET} Replaces
| Component | Current Count | Target Count | Change |
|-----------|--------------|--------------|--------|
| Hooks | X | Y | +Z new, -W removed |
| Skills | X | Y | +Z new |
| Agents | X | Y | +Z new |

### New in v{TARGET}
- [List new hooks]
- [List new skills]
- [List new agents]
- [List new features from settings.json schema]

### Settings.json Schema Changes
| Key | Current | Target | Action |
|-----|---------|--------|--------|
| ... | ... | ... | Keep/Add/Migrate/Remove |

### Potential Concerns
[Any issues identified — missing baselines, dirty working tree, etc.]
```

---

## After Dry Run

Ask the user: "Ready to proceed with the full migration? Say `/migrate` to build the merged installation."
