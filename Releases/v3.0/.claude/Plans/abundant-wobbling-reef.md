# PAI v3.0 to v4.0.3 Migration Plan

## Context

Andy runs a three-layer PAI architecture where `~/.claude` is a symlink to the active release in `pai-system/Releases/`. All personal data lives in `~/github/marvin/` (Layer 2) or `~/.config/pai/` (Layer 3), symlinked into the release directory. Upgrading means creating symlinks in v4.0.3 and switching the top-level pointer. No data copies.

The upstream PAI repo has been synced (PR #38 merged). v4.0.3 is available locally.

---

## Phase 1: Pre-Migration Validation (read-only, safe)

- Snapshot current v3.0 symlinks for comparison
- Validate all Layer 2 targets exist in `marvin/` (settings.json, commands, mcp-servers, mcp-pins.json, plans, .claude, USER, MEMORY/*, skills/*, Tools/hooks/*)
- Validate all Layer 3 targets exist in `~/.config/pai/` (.credentials.json, .env, STATE)
- Confirm v4.0.3 vanilla release is intact

---

## Phase 2: Create Symlinks in v4.0.3

All work in `/home/andy/github/pai-system/Releases/v4.0.3/.claude/` -- does NOT affect live v3.0.

### 2A. Root-level (8 symlinks)
Back up vanilla `settings.json` as `settings.json.vanilla-v4.0.3`, then:
- `settings.json` -> `marvin/settings.json`
- `commands` -> `marvin/commands`
- `mcp-servers` -> `marvin/mcp-servers`
- `mcp-pins.json` -> `marvin/mcp-pins.json`
- `plans` -> `marvin/plans`
- `.claude` -> `marvin/.claude`
- `.credentials.json` -> `~/.config/pai/.credentials.json`
- `.env` -> `~/.config/pai/.env`

### 2B. MEMORY (6 symlinks)
- `MEMORY/LEARNING` -> `marvin/MEMORY/LEARNING`
- `MEMORY/RELATIONSHIP` -> `marvin/MEMORY/RELATIONSHIP`
- `MEMORY/SECURITY` -> `marvin/MEMORY/SECURITY`
- `MEMORY/VOICE` -> `marvin/MEMORY/VOICE`
- `MEMORY/WORK` -> `marvin/MEMORY/WORK`
- `MEMORY/STATE` -> `~/.config/pai/STATE`

### 2C. Skills (13 symlinks)
Same 13 advisor skills: Analyse, EngineerAgent, IdeasCapture, OperationsAdvisor, PAIMigrate, ProductManager, QualityAdvisor, RailAdvisor, SecurityAdvisor, SolutionShaper, StoryCrafter, TechnicalDesigner, VoiceServer -- all -> `marvin/skills/{name}`

### 2D. USER data (PATH CHANGE)
**v3.0:** `skills/PAI/USER` -> `marvin/USER`
**v4.0.3:** `PAI/USER` -> `marvin/USER` (PAI moved out of skills/)

Back up vanilla `PAI/USER` as `PAI/USER.vanilla-v4.0.3`, replace with symlink.
Create missing v4 directories in marvin/USER: `ACTIONS/`, `TERMINAL/`, `Workflows/`

### 2E. Hook symlinks (5 existing from marvin)
Same 5: AdvisorConversationFileGuard, AdvisorIdentityLock, AdvisorStatePreserver, FluxBashGuard, PipelineGateGuard -- all -> `marvin/Tools/hooks/{name}.hook.ts`

### 2F. Migrate 4 non-symlinked custom hooks INTO marvin
These exist as real files in v3.0 (not symlinked). Move to `marvin/Tools/hooks/` and symlink:
- ContextCompression.hook.ts
- EventCapture.hook.ts
- MCPGuard.hook.ts
- SymlinkIntegrity.hook.ts

### 2G. .gitignore
Merge v3.0 .gitignore entries into v4.0.3 (add symlink exclusions, personal data paths, custom skill dirs)

---

## Phase 3: Stock Hook Modifications

### 3A. Paperclip guard on all 20 v4.0.3 stock hooks
Add after shebang line:
```typescript
// Paperclip agent isolation: skip PAI hooks in Paperclip child processes
if (process.env.PAPERCLIP_AGENT_ID) process.exit(0);
```

Scriptable with sed across all `*.hook.ts` in v4.0.3 hooks/.

### 3B. LoadContext -- use v4 vanilla as-is
v4's LoadContext is a complete rewrite (dynamic context injection via `loadAtStartup` + `dynamicContext` settings). The v3 custom enhancements (advisor session recovery) are NOT ported -- they can be implemented as a separate custom hook later if needed.

---

## Phase 4: settings.json Migration

Lives in `marvin/settings.json` (shared via symlink). Updating it is the point of no return for v3.0.

**Before editing:** commit marvin snapshot for rollback.

### Key changes:
1. **Hooks section:** Full rewrite to v4 matcher-based schema. Merge custom hooks into the new structure.
2. **Remove hooks:** AlgorithmTracker, AutoWorkCreation, CheckVersion, SessionSummary, StartupGreeting, StopOrchestrator, VoiceGate
3. **Add hooks:** DocIntegrity, KittyEnvPersist, LastResponseCache, PRDSync, ResponseTabReset, SessionCleanup, VoiceCompletion
4. **contextFiles:** Empty the array (v4 uses CLAUDE.md natively)
5. **Add `loadAtStartup`:** PAI/AISTEERINGRULES.md, PAI/USER/AISTEERINGRULES.md, PAI/USER/PROJECTS/PROJECTS.md
6. **Add `dynamicContext`:** relationshipContext, learningReadback, activeWorkSummary (all true)
7. **Version:** pai.version -> "4.0.3", add pai.algorithmVersion -> "3.7.0"
8. **Preserve:** identity (Marvin/Andy), voice config, techStack prefs (arc, pip), skipDangerousModePermissionPrompt, notifications, contextDisplay, counts

---

## Phase 5: Custom Hook Path Compatibility

Check all 9 custom hooks in `marvin/Tools/hooks/` for:
- `skills/PAI/` references -> `PAI/` (path moved in v4)
- `skills/PAI/USER/` -> `PAI/USER/`
- `skills/PAI/SKILL.md` -> `CLAUDE.md` (if referenced)

Update `SymlinkIntegrity.hook.ts` manifest to reflect v4 paths (especially `PAI/USER`).

---

## Phase 6: Cutover

```bash
ln -sfn /home/andy/github/pai-system/Releases/v4.0.3/.claude /home/andy/.claude
```

---

## Phase 7: Verification

1. All symlinks resolve (find + test)
2. `readlink ~/.claude` -> v4.0.3 path
3. New Claude Code session starts cleanly
4. CLAUDE.md loads (check for v4 identity)
5. Custom skills discoverable (/analyse, /build, /shape)
6. Custom hooks fire (PipelineGateGuard on prompt, SymlinkIntegrity on start)
7. MEMORY directories readable
8. Status line shows v4.0.3

---

## Phase 8: Rollback

```bash
# Switch back
ln -sfn /home/andy/github/pai-system/Releases/v3.0/.claude /home/andy/.claude

# Revert settings.json if already updated
cd ~/github/marvin && git checkout HEAD~1 -- settings.json
```

---

## Execution Order

1. Phase 1 -- validate (safe, read-only)
2. Phase 2 -- create all symlinks in v4.0.3 (safe, doesn't touch live system)
3. Phase 3 -- Paperclip guards on v4 stock hooks (safe, doesn't touch live system)
4. Phase 2F -- move 4 hooks to marvin (creates files, doesn't break v3)
5. Phase 5 -- update custom hook paths (test with v3 still live)
6. **Commit marvin snapshot** (safety net)
7. Phase 4 -- update settings.json (point of no return for v3)
8. Phase 6 -- switch symlink (the actual cutover)
9. Phase 7 -- verify
10. Phase 8 -- rollback if needed

---

## Critical Files

| File | Why |
|------|-----|
| `marvin/settings.json` | Shared config -- hook schema rewrite needed |
| `v4.0.3/.claude/settings.json.vanilla-v4.0.3` | Reference for hook schema |
| `v4.0.3/.claude/PAI/USER` | Path change from `skills/PAI/USER` |
| `marvin/Tools/hooks/SymlinkIntegrity.hook.ts` | Manifest needs v4 paths |
| `v4.0.3/.claude/CLAUDE.md` | New entry point (replaces SKILL.md) |
| `v4.0.3/.claude/hooks/LoadContext.hook.ts` | Completely rewritten in v4 |
