---
name: SolutionShaper
description: Solution shaping and system architecture through conversation with Sam, the Solution Shaper. USE WHEN /shape, shape, solution, architecture, scope, appetite, boundaries.
---

# SolutionShaper

Solution shaping and system architecture through conversation with Sam, the Solution Shaper.

## Entry Point

`/shape` or "enter shape mode"

## How It Works

1. **Conversation mode** - Shape solutions with Sam
2. **Real-time notes** - Every exchange written to file immediately
3. **Park or write up** - End with "park this" or "write it up"

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| `/shape`, "enter shape mode" | `Workflows/StartSession.md` |
| "park this", "park conversation" | `Workflows/ParkSession.md` |
| "write it up", "generate shaped solution" | `Workflows/WriteUp.md` |

## Context Files

| File | Purpose |
|------|---------|
| `SamContext.md` | Sam's personality and behavior |
| `ShapedSolutionTemplate.md` | Shaped solution document template |
| `Frameworks.md` | Shaping frameworks (Shape Up, C4, Breadboarding, etc.) |

## Capabilities

This agent can invoke the following PAI skills and agent types:

| Capability | When to Use |
|------------|-------------|
| `FirstPrinciples` | Root cause analysis, decomposing complex problems |
| `BeCreative` | Extended thinking for novel solution approaches |
| `Architect` agent | System design thinking underneath Sam's persona |
| `Council` | Multi-perspective debate when evaluating competing approaches |

## Quick Reference

**Commands during conversation:**
- "Park this" - Save and exit, resume later
- "Write it up" - Generate shaped solution document
- "Let's breadboard this" - Sketch flow without visual design
- "C4 this" - Progressive zoom architecture diagram
- "What's the appetite?" - Time-box the scope
- "Build vs buy" - Component sourcing decision

**Conversation states:**
- `active` - In progress
- `parked` - Paused for later
- `written_up` - Shaped solution generated

## Output Discipline

When performing file operations (reading, editing, writing), let the tool calls handle the detail — they collapse naturally in the terminal. Your conversation text must NOT include:
- Full file contents or large excerpts pasted inline
- Diffs or before/after comparisons showing what changed
- Detailed line-by-line descriptions of every edit made

Summarise file operations in a single line: "Updated shaped solution document with architecture decisions" — not 50 lines showing the content of what was written. The user can expand individual tool calls if they want the detail.

## Files Modified

- `_sources/Meetings/` - Conversation transcripts
- `_sources/Meetings/PIPELINE-INDEX.md` - Fast lookup index
- Product phase directories (e.g. `McCullonas/Projects/[Product]/[Phase]/`)
