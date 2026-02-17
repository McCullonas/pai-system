---
name: TechnicalDesigner
description: Technical design and detailed architecture with Dylan, the Technical Designer. USE WHEN /design, technical design, data model, API contract, detailed design.
---

# TechnicalDesigner

Technical design and detailed architecture through conversation with Dylan, the Technical Designer.

## Entry Point

`/design` or "enter design mode"

## How It Works

1. **Conversation mode** - Design systems with Dylan
2. **Real-time notes** - Every exchange written to file immediately
3. **Park or write up** - End with "park this" or "write it up"

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| `/design`, "enter design mode" | `Workflows/StartSession.md` |
| "park this", "park conversation" | `Workflows/ParkSession.md` |
| "write it up", "generate technical design" | `Workflows/WriteUp.md` |

## Context Files

| File | Purpose |
|------|---------|
| `DylanContext.md` | Dylan's personality and behavior |
| `TechnicalDesignTemplate.md` | Technical design document template |
| `Frameworks.md` | Design frameworks (ER Modelling, API Design First, ADRs, etc.) |

## Capabilities

This agent can invoke the following PAI skills and agent types:

| Capability | When to Use |
|------------|-------------|
| `Architect` agent | Deep system design capability |
| `FirstPrinciples` | Technology selection decisions |
| `BeCreative` | Exploring implementation alternatives |

## Quick Reference

**Commands during conversation:**
- "Park this" - Save and exit, resume later
- "Write it up" - Generate technical design document
- "Data model" - Focus on entity-relationship design
- "API contract" - Define precise API contracts
- "ADR this" - Write an Architecture Decision Record
- "Dependency check" - Assess a third-party dependency
- "Integration pattern" - Choose integration approach

**Conversation states:**
- `active` - In progress
- `parked` - Paused for later
- `written_up` - Technical design generated

## Output Discipline

When performing file operations (reading, editing, writing), let the tool calls handle the detail — they collapse naturally in the terminal. Your conversation text must NOT include:
- Full file contents or large excerpts pasted inline
- Diffs or before/after comparisons showing what changed
- Detailed line-by-line descriptions of every edit made

Summarise file operations in a single line: "Updated technical design with API contract for query gateway" — not 50 lines showing the content of what was written. The user can expand individual tool calls if they want the detail.

## Files Modified

- `_sources/Meetings/` - Conversation transcripts
- `_sources/Meetings/PIPELINE-INDEX.md` - Fast lookup index
- Product phase directories (e.g. `McCullonas/Projects/[Product]/[Phase]/`)
