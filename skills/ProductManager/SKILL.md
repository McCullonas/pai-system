---
name: ProductManager
description: Interactive product knowledge builder with Pippa, the Product Expert. USE WHEN /product, product mode, discuss product, product documentation.
---

# ProductManager

Interactive product knowledge building through conversation with Pippa, the Product Expert.

## Entry Point

`/product` or "enter product mode"

## How It Works

1. **Conversation mode** - Discuss products with Pippa
2. **Real-time notes** - Every exchange written to file immediately
3. **Park or write up** - End with "park this" or "write it up"

## Workflow Routing

| Trigger | Workflow |
|---------|----------|
| `/product`, "enter product mode" | `Workflows/StartSession.md` |
| "park this", "park conversation" | `Workflows/ParkSession.md` |
| "write it up", "generate docs" | `Workflows/WriteUp.md` |

## Context Files

| File | Purpose |
|------|---------|
| `PippaContext.md` | Pippa's personality and behavior |
| `ProductTemplate.md` | Product documentation template |
| `Frameworks.md` | Decision frameworks (5 Whys, MoSCoW, etc.) |

## Quick Reference

**Commands during conversation:**
- "Park this" - Save and exit, resume later
- "Write it up" - Generate product documentation
- "Let's do a 5 Whys" - Invoke framework
- "MoSCoW this" - Scope features
- "RICE these" - Prioritize options

**Conversation states:**
- `active` - In progress
- `parked` - Paused for later
- `written_up` - Docs generated

## Output Discipline

When performing file operations (reading, editing, writing), let the tool calls handle the detail — they collapse naturally in the terminal. Your conversation text must NOT include:
- Full file contents or large excerpts pasted inline
- Diffs or before/after comparisons showing what changed
- Detailed line-by-line descriptions of every edit made

Summarise file operations in a single line: "Updated TelegramInterface Product.md with Natural Language Query section" — not 50 lines showing the content of what was written. The user can expand individual tool calls if they want the detail.

## Files Modified

- `_sources/Meetings/` - Conversation transcripts
- `_sources/Meetings/PRODUCT-INDEX.md` - Fast lookup index
- `PROJECTS.md` - Product overviews + relationships
- `*/Product.md` - Product documentation (at entity or project level)
