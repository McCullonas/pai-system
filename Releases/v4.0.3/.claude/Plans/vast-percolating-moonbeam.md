# Plan: Incorporate V2 KB Schema Improvements

## Context

Andy exported the KB schema package to another PAI instance (Orac) a week ago. That instance refined the process significantly: adding feature versioning (F{NNN}/V{N}), living root documents (PRODUCT, FEATURES, DECISIONS, IDEAS), signposted specs, question tracking, autonomous PRD generation, issue decomposition (AFK/HITL), and a Sandcastle/Ralph build loop. The refined v2 package has been imported back and needs incorporating into this system's canonical schema, process, agents, and templates.

**Decisions made:**
- Subsidiary hierarchy excluded (Orac-specific)
- Paperclip companies NOT required — Pippa orchestrates the whole process
- Schema version: v2.3 → v3.1 (iterating on the v3.0 export, not leaping to v4)
- Everything canonical lives in **mccullonas-kb**: schema, process, agents, templates
- Phase 12 Build stays fully documented (reference for how Sandcastle works)
- Keep Bea — don't remove her
- No Ralph agent needed — Sandcastle is repo-level config, not a process agent
- Consolidate one agent first (Sam) as test case, compare against v2, then proceed
- PROCESS.md moves OUT of paperclip-build repo into mccullonas-kb (process is not Paperclip-specific)
- Templates move from `_exports/kb-schema-package/templates/` to `mccullonas-kb/templates/` (canonical, not ephemeral)

## Canonical Structure in mccullonas-kb

```
mccullonas-kb/
├── KB-SCHEMA.md          # Schema v3.1
├── PROCESS.md            # 12-phase process (moved from paperclip-build)
├── agents/               # Agent definitions (new canonical home)
│   ├── pipeline/         # sam.md, oscar.md, serena.md, uma.md, dylan.md, ren.md, rex.md, tess.md, suki.md
│   ├── design/           # faye.md, wyn.md, juno.md
│   ├── discovery/        # luna.md, mira.md, echo.md, kai.md, nix.md
│   ├── architecture/     # atlas.md, sage.md
│   └── build/            # bea.md, ceo.md
└── templates/            # All templates (moved from _exports/)
    ├── CONSTITUTION.md
    ├── OVERVIEW.md
    ├── PRODUCT.md         (new)
    ├── FEATURES.md        (new)
    ├── DECISIONS.md       (new)
    ├── STACK.md
    ├── concept-brief.md
    ├── run-pipeline.md    (new, adapted from Orac)
    ├── workbreakdown-agent-prompt.md (new, adapted from Orac)
    └── deliverables/      # All 22 files that make up a feature version (V{N}/)
        ├── spec.md            (updated with Signposts)
        ├── pipeline.yaml      (updated with prd+issues stages)
        ├── shape.md           (new — Sam's output structure)
        ├── shape.questions.md
        ├── ops.md             (new — Oscar's output structure)
        ├── ops.questions.md
        ├── security.md        (new — Serena's output structure)
        ├── security.questions.md
        ├── ux.md              (new — Uma's output structure)
        ├── ux.questions.md
        ├── design.md          (new — Dylan's output structure)
        ├── design.questions.md
        ├── research.md        (new — Ren's output structure)
        ├── research.questions.md
        ├── redteam.md         (new — Rex's output structure)
        ├── redteam.questions.md
        ├── quality.md         (new — Tess's output structure)
        ├── quality.questions.md
        ├── stories.md         (new — Suki's output structure)
        ├── stories.questions.md
        ├── prd.md             (new — PRD Generation output)
        └── issues-index.md    (new — Issue Decomposition output)
```

## Execution Plan

### Phase A — Schema Update

**Step A1:** Update `/home/andy/github/mccullonas-kb/KB-SCHEMA.md` from v2.3 → v3.1

- Add living root documents: PRODUCT.md (13 sections), FEATURES.md (F-numbering), DECISIONS.md (D-numbers), IDEAS.md
- Feature versioning: `F{NNN}-PascalCase/` folders with `V{N}/` version subfolders
- 22 files per deliverable (drop build/deploy/test, add prd.md + issues-index.md)
- Pipeline: `spec > shape > ops > security > ux > design > research > redteam > quality > stories > prd > issues`
- Signposts section in spec.md template
- Naming conventions table
- PRD and Issue templates inline
- Migration notes: v2.3 → v3.1
- Update template/agent path references to new canonical locations

Source: `/tmp/kb-compare/v2/kb-schema-package-v2/SCHEMA.md`

---

### Phase B — Templates

**Move** existing templates from `_exports/kb-schema-package/templates/` to `mccullonas-kb/templates/`

**B1-B3: New root-level templates**

| Step | File | Action |
|------|------|--------|
| B1 | `PRODUCT.md` | Create (13 sections) |
| B2 | `FEATURES.md` | Create (F-number columns) |
| B3 | `DECISIONS.md` | Create (D-number format) |

**B4-B5: Process templates**

| Step | File | Action |
|------|------|--------|
| B4 | `run-pipeline.md` | Create (from v2, replace Orac paths with placeholders) |
| B5 | `workbreakdown-agent-prompt.md` | Create (from v2, replace Orac paths) |

**B6: Deliverable templates (all 22 files in `templates/deliverables/`)**

Each stage gets a proper template with the output structure that agent produces (section headings, expected content areas, markers). Derived from agent definitions + v2 schema.

| File | Agent | Content |
|------|-------|---------|
| `spec.md` | Human+Pippa | Updated: add Signposts, Scope, Appetite |
| `pipeline.yaml` | System | Updated: add prd+issues stages |
| `shape.md` | Sam | Appetite, boundaries, risks, rabbit holes, feasibility |
| `shape.questions.md` | Sam | Lookup + judgment questions |
| `ops.md` | Oscar | Deployment target, infra, CI/CD, monitoring, health checks |
| `ops.questions.md` | Oscar | Lookup + judgment questions |
| `security.md` | Serena | STRIDE threat model, auth, data classification, mitigations |
| `security.questions.md` | Serena | Lookup + judgment questions |
| `ux.md` | Uma | User journeys, interaction patterns, states, accessibility |
| `ux.questions.md` | Uma | Lookup + judgment questions |
| `design.md` | Dylan | Data models, API contracts, component arch, ADRs |
| `design.questions.md` | Dylan | Lookup + judgment questions |
| `research.md` | Ren | Verified API contracts, library checks, rework items |
| `research.questions.md` | Ren | Lookup + judgment questions |
| `redteam.md` | Rex | Findings with severity, affected stage, recommendations |
| `redteam.questions.md` | Rex | Lookup + judgment questions |
| `quality.md` | Tess | Test strategy, acceptance criteria, edge cases |
| `quality.questions.md` | Tess | Lookup + judgment questions |
| `stories.md` | Suki | User stories, delivery sequence, sizing |
| `stories.questions.md` | Suki | Lookup + judgment questions |
| `prd.md` | Autonomous | Problem, solution, stories (15-30), decisions, testing |
| `issues-index.md` | Autonomous | GitHub issue index with AFK/HITL classification |

---

### Phase C — Agent Restructure

**Step C1:** Test case — consolidate Sam (AGENTS.md + SOUL.md → sam.md)
- Compare result against v2 sam.md
- Validate approach before proceeding

**Step C2:** Consolidate remaining pipeline agents (8 agents)
**Step C3:** Consolidate design agents (3 agents)
**Step C4:** Consolidate discovery agents (5 agents)
**Step C5:** Consolidate architecture agents (2 agents)
**Step C6:** Consolidate build agents (CEO, Bea)

**Per-agent approach:**
1. V2 single .md as structural base (embedded personality)
2. UNION of v2 + our expanded read lists
3. Merge distinctive SOUL.md personality content
4. Strip Paperclip workflow (issue marking, CEO approval, in_review, $AGENT_HOME)
5. `{Project}/` and `{Feature}/V{N}/` path conventions

---

### Phase D — Process

**Step D1:** Create `/home/andy/github/mccullonas-kb/PROCESS.md` (new file, not editing paperclip-build)

12 phases with Pippa orchestration, 6 human gates, living documents table, artefact flow, agent index, Phase 12 Build fully documented, AFK/HITL, question resolution break.

Source: v2 PROCESS.md adapted for this system.

---

### Phase E — Validation & Cleanup

- Cross-reference all paths
- Migration notes for in-flight projects
- Clean up old locations (note in paperclip-build PROCESS.md that canonical version moved)
- Rebuild export package if needed

---

## Verification

1. KB-SCHEMA.md v3.1 has all 4 new root docs, F-numbering, V{N} versioning, naming conventions
2. All templates exist: 8 root-level in `templates/`, 22 deliverables in `templates/deliverables/`
3. Sam.md test case validated, then all 21 agents consolidated in `mccullonas-kb/agents/`
4. PROCESS.md in mccullonas-kb has 12 phases, 6 gates, living documents, Phase 12
5. No Paperclip company dependencies, no subsidiary hierarchy
6. No broken cross-references
