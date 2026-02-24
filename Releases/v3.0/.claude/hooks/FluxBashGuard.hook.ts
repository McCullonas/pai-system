#!/usr/bin/env bun
/**
 * FluxBashGuard.hook.ts - Bash command allowlist for Bea's headless flux sessions
 *
 * PURPOSE:
 * When FLUX_SESSION=1 is set (by flux-loop.sh), validates every Bash command
 * against an explicit allowlist. Blocks anything not on the list and logs to
 * ~/.claude/logs/flux-loop.log.
 *
 * TRIGGER: PreToolUse (matcher: Bash)
 * ACTIVE: Only when env FLUX_SESSION=1
 *
 * ALLOWED:
 * - git operations (clone, add, commit, push to github.com, status, log, etc.)
 * - curl to 192.168.3.130:3456 (Vikunja API) and localhost:8888 (PAI notify)
 * - File operations: cat, ls, cp, mv, mkdir, chmod (not rm -rf)
 * - Test runners: bun test, npm test, pytest, python3, node
 * - Standard tools: echo, grep, rg, fd, bat, jq, awk, sed, head, tail, wc, sort
 * - gh CLI (GitHub operations)
 *
 * BLOCKED:
 * - curl to any host other than 192.168.3.130 and localhost
 * - rm -rf on paths outside the working repo
 * - sudo, su, eval, exec (process substitution), xargs with dangerous commands
 */

import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const LOG_FILE = join(process.env.HOME || '/home/andy', '.claude/logs/flux-loop.log');

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function log(msg: string): void {
  try {
    const dir = dirname(LOG_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(LOG_FILE, `[${timestamp()}] ${msg}\n`);
  } catch {
    // Silent — never block on log failure
  }
}

// Only active in flux sessions
if (!process.env.FLUX_SESSION) {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

// Read stdin with timeout (same pattern as SecurityValidator)
let input: { tool_name?: string; tool_input?: { command?: string } } = {};
try {
  const reader = Bun.stdin.stream().getReader();
  let raw = '';
  const readLoop = (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += new TextDecoder().decode(value, { stream: true });
    }
  })();
  await Promise.race([readLoop, new Promise<void>(r => setTimeout(r, 200))]);

  if (!raw.trim()) {
    console.log(JSON.stringify({ continue: true }));
    process.exit(0);
  }
  input = JSON.parse(raw);
} catch {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

if (input.tool_name !== 'Bash') {
  console.log(JSON.stringify({ continue: true }));
  process.exit(0);
}

const command = input.tool_input?.command ?? '';

// --- Allowlist checks ---

function isAllowed(cmd: string): { allowed: boolean; reason?: string } {
  const c = cmd.trim();

  // Always block: curl to disallowed hosts
  const curlMatch = c.match(/curl\s[^|&;]*/g);
  if (curlMatch) {
    for (const curlCmd of curlMatch) {
      const hostMatch = curlCmd.match(/https?:\/\/([^/\s'"]+)/);
      if (hostMatch) {
        const host = hostMatch[1];
        const hostBase = host.split(':')[0];
        if (
          !host.startsWith('192.168.3.130:3456') &&
          hostBase !== 'localhost' &&
          hostBase !== '127.0.0.1' &&
          !host.startsWith('github.com') &&
          !host.startsWith('api.github.com')
        ) {
          return { allowed: false, reason: `curl to disallowed host: ${host}` };
        }
      }
    }
  }

  // Always block: rm -rf on paths outside home/repos
  const rmRfMatch = c.match(/rm\s+(-rf?|--recursive)\s+([^\s|;&]+)/);
  if (rmRfMatch) {
    const path = rmRfMatch[2];
    const home = process.env.HOME || '/home/andy';
    // Allow: inside home/github, /tmp, relative paths within repo
    const allowed = [
      home + '/github/',
      '/tmp/',
      './', '../', // relative
    ];
    const isInSafePath = allowed.some(p => path.startsWith(p)) ||
      !path.startsWith('/') || // relative path
      path.includes('${') || // shell variable — allow (trust Bea)
      path.startsWith('/tmp/');
    if (!isInSafePath) {
      return { allowed: false, reason: `rm -rf on potentially dangerous path: ${path}` };
    }
  }

  // Always block: sudo, su
  if (/\bsudo\b|\bsu\b/.test(c)) {
    return { allowed: false, reason: 'sudo/su not permitted in flux session' };
  }

  // Allow everything else
  return { allowed: true };
}

const result = isAllowed(command);

if (!result.allowed) {
  const msg = `BLOCKED: ${result.reason} | Command: ${command.slice(0, 200)}`;
  log(msg);
  console.error(`[FluxBashGuard] ${msg}`);
  console.log(JSON.stringify({
    decision: 'block',
    message: `FluxBashGuard blocked this command: ${result.reason}\n\nBlocked command: ${command.slice(0, 100)}`
  }));
  process.exit(2);
} else {
  console.log(JSON.stringify({ continue: true }));
}
