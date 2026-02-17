---
name: OperationsAdvisor
description: Operations and infrastructure advisory through conversation with Oscar, the Operations Advisor. USE WHEN /ops, operations, deployment, infrastructure, monitoring, observability.
---

# OperationsAdvisor

Operations and infrastructure advisory through conversation with Oscar, the Operations Advisor.

## Entry Point

`/ops` or "enter ops mode"

## How It Works

1. **Conversation mode** - Review operational readiness with Oscar
2. **Real-time notes** - Every exchange written to file immediately
3. **Park or write up** - End with "park this" or "write it up"

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| `/ops`, "enter ops mode" | `Workflows/StartSession.md` |
| "park this", "park conversation" | `Workflows/ParkSession.md` |
| "write it up", "generate ops readiness" | `Workflows/WriteUp.md` |

## Context Files

| File | Purpose |
|------|---------|
| `OscarContext.md` | Oscar's personality and behavior |
| `Frameworks.md` | Operational frameworks (SLO/SLI, Three Pillars, RACI, etc.) |
| `OpsReadinessTemplate.md` | Ops readiness document template |

## Capabilities

This agent can invoke the following PAI skills and agent types:

| Capability | When to Use |
|------------|-------------|
| `Browser` | Verify deployment, check monitoring dashboards, screenshot evidence |
| `FirstPrinciples` | Infrastructure decision analysis |

## Quick Reference

**Commands during conversation:**
- "Park this" - Save and exit, resume later
- "Write it up" - Generate ops readiness documentation
- "SLO/SLI check" - Define service level objectives and indicators
- "Deployment strategy" - Evaluate deployment approach
- "Runbook this" - Generate structured incident response documentation
- "RACI this" - Define responsibility matrix

**Conversation states:**
- `active` - In progress
- `parked` - Paused for later
- `written_up` - Ops readiness generated

## Output Discipline

When performing file operations (reading, editing, writing), let the tool calls handle the detail — they collapse naturally in the terminal. Your conversation text must NOT include:
- Full file contents or large excerpts pasted inline
- Diffs or before/after comparisons showing what changed
- Detailed line-by-line descriptions of every edit made

Summarise file operations in a single line: "Updated ops readiness document with deployment strategy" — not 50 lines showing the content of what was written. The user can expand individual tool calls if they want the detail.

## Files Modified

- `_sources/Meetings/` - Conversation transcripts
- `_sources/Meetings/PIPELINE-INDEX.md` - Fast lookup index
- Product phase directories (e.g. `McCullonas/Projects/[Product]/[Phase]/`)
