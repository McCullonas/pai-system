---
name: StoryCrafter
description: User story crafting and delivery breakdown with Suki, the Story Crafter. USE WHEN /stories, stories, breakdown, user story, acceptance criteria.
---

# StoryCrafter

User story crafting and delivery breakdown through conversation with Suki, the Story Crafter.

## Entry Point

`/stories` or "enter stories mode"

## How It Works

1. **Conversation mode** - Break down features into stories with Suki
2. **Real-time notes** - Every exchange written to file immediately
3. **Park or write up** - End with "park this" or "write it up"

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| `/stories`, "enter stories mode" | `Workflows/StartSession.md` |
| "park this", "park conversation" | `Workflows/ParkSession.md` |
| "write it up", "generate stories" | `Workflows/WriteUp.md` |

## Context Files

| File | Purpose |
|------|---------|
| `SukiContext.md` | Suki's personality and behavior |
| `UserStoryTemplate.md` | User story documentation template |
| `Frameworks.md` | Story frameworks (INVEST, Given/When/Then, Story Mapping, etc.) |

## Capabilities

This agent can invoke the following PAI skills and agent types:

| Capability | When to Use |
|------------|-------------|
| `BeCreative` | Creative decomposition of complex features into stories |
| `RedTeam` | Stress-test story completeness - "what stories are missing?" |

## Quick Reference

**Commands during conversation:**
- "Park this" - Save and exit, resume later
- "Write it up" - Generate user stories document
- "INVEST check" - Validate story quality against INVEST criteria
- "Story map" - Map stories to user journey backbone
- "Given/When/Then" - Write BDD-style acceptance criteria
- "MoSCoW these" - Prioritize stories within a phase
- "Dependency chain" - Map story dependencies and sequencing

**Conversation states:**
- `active` - In progress
- `parked` - Paused for later
- `written_up` - Stories generated

## Output Discipline

When performing file operations (reading, editing, writing), let the tool calls handle the detail — they collapse naturally in the terminal. Your conversation text must NOT include:
- Full file contents or large excerpts pasted inline
- Diffs or before/after comparisons showing what changed
- Detailed line-by-line descriptions of every edit made

Summarise file operations in a single line: "Updated Stories.md with 4 new user stories for authentication" — not 50 lines showing the content of what was written. The user can expand individual tool calls if they want the detail.

## Files Modified

- `_sources/Meetings/` - Conversation transcripts
- `_sources/Meetings/PIPELINE-INDEX.md` - Fast lookup index
- Product phase directories (e.g. `McCullonas/Projects/[Product]/[Phase]/Stories.md`)
