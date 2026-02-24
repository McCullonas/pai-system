#!/usr/bin/env bash
# flux-loop.sh — Autonomous Bea loop: invoke Bea until no Ready cards remain
#
# Usage: flux-loop.sh [--project <name>]
#
# Exit 0: Clean exit (queue empty or Bea done)
# Exit 1: Abnormal exit (error)

set -uo pipefail

LOCK_FILE="/tmp/flux-bea.lock"
LOG_FILE="$HOME/.claude/logs/flux-loop.log"
NOTIFY_URL="http://localhost:8888/notify"
COMPLETE_SH="$HOME/github/pai-system/Tools/flux-complete.sh"
HEADLESS_PROMPT="$HOME/github/pai-system/Tools/bea-headless.md"
PROJECT_NAME=""

# --- args ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --project) PROJECT_NAME="${2:?--project requires a name}"; shift 2;;
        *) shift;;
    esac
done

# --- setup ---
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "$msg"
    echo "$msg" >> "$LOG_FILE"
}

notify() {
    curl -s -X POST "$NOTIFY_URL" \
        -H "Content-Type: application/json" \
        -d "{\"message\": $(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$1")}" \
        2>/dev/null || true
}

# --- lock ---
if [[ -f "$LOCK_FILE" ]]; then
    existing_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
        notify "Bea is already running"
        log "Bea already running (PID $existing_pid) — exiting"
        exit 0
    else
        log "Removing stale lock file (PID ${existing_pid:-unknown} not running)"
        rm -f "$LOCK_FILE"
    fi
fi

echo $$ > "$LOCK_FILE"
trap 'log "EXIT: removing lock file"; rm -f "$LOCK_FILE"' EXIT SIGTERM SIGINT

log "flux-loop.sh starting${PROJECT_NAME:+ project=$PROJECT_NAME}"

# --- token ---
export VIKUNJA_TOKEN="${VIKUNJA_TOKEN:-}"
if [[ -z "$VIKUNJA_TOKEN" ]] && [[ -f "$HOME/.config/pai/.env" ]]; then
    VIKUNJA_TOKEN=$(grep 'VIKUNJA_API_KEY' "$HOME/.config/pai/.env" | cut -d= -f2)
fi
if [[ -z "$VIKUNJA_TOKEN" ]] && [[ -f "$HOME/.env" ]]; then
    VIKUNJA_TOKEN=$(grep 'VIKUNJA_TOKEN' "$HOME/.env" | cut -d= -f2)
fi
if [[ -z "$VIKUNJA_TOKEN" ]]; then
    log "ERROR: VIKUNJA_TOKEN not set and not found in credential files"
    exit 1
fi
export VIKUNJA_TOKEN

# --- main loop ---
iteration=0
while true; do
    iteration=$((iteration + 1))
    log "--- Iteration $iteration: invoking Bea ---"

    # Build prompt
    if [[ ! -f "$HEADLESS_PROMPT" ]]; then
        log "ERROR: headless prompt not found: $HEADLESS_PROMPT"
        notify "Bea hit an error, action needed"
        exit 1
    fi
    PROMPT="$(cat "$HEADLESS_PROMPT")"
    if [[ -n "$PROJECT_NAME" ]]; then
        PROMPT="${PROMPT}

You are scoped to the ${PROJECT_NAME} work queue. Query and claim cards only from this project."
    fi

    # Invoke Bea — capture output and exit code reliably
    # FLUX_SESSION=1 activates FluxBashGuard hook for Bea's session
    bea_exit=0
    tmp_bea=$(mktemp)
    FLUX_SESSION=1 claude -p "$PROMPT" \
        --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebFetch" \
        >"$tmp_bea" 2>&1 || bea_exit=$?
    cat "$tmp_bea" | tee -a "$LOG_FILE"
    rm -f "$tmp_bea"

    log "Bea exited with code $bea_exit"

    if [[ "$bea_exit" -eq 0 ]]; then
        log "Bea succeeded — running flux-complete.sh"
        complete_exit=0
        tmp_complete=$(mktemp)
        if [[ -n "$PROJECT_NAME" ]]; then
            "$COMPLETE_SH" --project "$PROJECT_NAME" >"$tmp_complete" 2>&1 || complete_exit=$?
        else
            "$COMPLETE_SH" >"$tmp_complete" 2>&1 || complete_exit=$?
        fi
        cat "$tmp_complete" | tee -a "$LOG_FILE"
        rm -f "$tmp_complete"

        if [[ "$complete_exit" -eq 0 ]]; then
            log "Ready tasks exist — looping"
            continue
        elif [[ "$complete_exit" -eq 1 ]]; then
            log "No Ready tasks — queue empty"
            notify "Bea is done, check your Review queue"
            exit 0
        else
            log "ERROR: flux-complete.sh exited $complete_exit — aborting"
            notify "Bea hit an error, action needed"
            exit 1
        fi
    else
        log "ERROR: Bea exited $bea_exit"
        notify "Bea hit an error, action needed"
        exit 1
    fi
done
