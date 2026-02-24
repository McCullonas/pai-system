#!/usr/bin/env python3
"""
vikunja-import.py — Generic Vikunja card import script.

Reads a JSON schema of cards and creates them in a Vikunja project,
setting bucket placement, priority, labels, user assignments, and
blocking relations.

Usage:
    python3 vikunja-import.py <schema.json>

Environment:
    VIKUNJA_TOKEN — required. Falls back to VIKUNJA_TOKEN= in ~/.env.

Schema format:
    {
      "meta": {
        "vikunja_project_id": 4,
        "bucket_ids": {
          "Backlog": 14,
          "Ready": 15,
          "In Progress": 16,
          "Review": 17,
          "Done": 18
        }
      },
      "cards": [
        {
          "id": "S1",
          "title": "S1 - Card title",
          "bucket": "Backlog",
          "assigned_to": "Bea",
          "blocks": ["S2"],
          "priority": "High",
          "label": "FluxIntegration",
          "description": "Acceptance criteria in plain text or Gherkin. No HTML."
        }
      ]
    }

Priority mapping: High → 3, Medium → 2, Low → 1
"""

import json
import logging
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path
from typing import Any

try:
    import requests
    from requests.exceptions import ConnectionError, Timeout
except ImportError:
    print("ERROR: 'requests' library not installed. Run: pip install requests", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_URL = "http://192.168.3.130:3456/api/v1"
LOG_FILE = Path.home() / ".claude" / "logs" / "flux-loop.log"
PRIORITY_MAP = {"High": 3, "Medium": 2, "Low": 1}
HTML_PATTERN = re.compile(r"<[a-zA-Z][^>]*>|</[a-zA-Z]+>")
MAX_RETRIES = 2
RETRY_BACKOFF_BASE = 2  # seconds

REQUIRED_CARD_FIELDS = {"id", "title", "bucket", "assigned_to", "priority", "label", "description"}
REQUIRED_META_FIELDS = {"vikunja_project_id", "bucket_ids"}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------


def setup_logging() -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    handler.setFormatter(logging.Formatter("[%(asctime)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"))
    logging.getLogger().addHandler(handler)
    logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))
    logging.getLogger().setLevel(logging.INFO)


log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Token loading
# ---------------------------------------------------------------------------


def get_token() -> str:
    token = os.environ.get("VIKUNJA_TOKEN", "").strip()
    if not token:
        env_path = Path.home() / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("VIKUNJA_TOKEN="):
                    token = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if not token:
        print("ERROR: VIKUNJA_TOKEN not set in environment or ~/.env", file=sys.stderr)
        sys.exit(1)
    return token


# ---------------------------------------------------------------------------
# Schema validation
# ---------------------------------------------------------------------------


def contains_html(text: str) -> bool:
    return bool(HTML_PATTERN.search(text))


def validate_schema(schema: dict) -> None:
    """Validate schema structure and card fields. Exits on error."""
    if "meta" not in schema:
        _fatal("Schema missing required 'meta' section")
    if "cards" not in schema or not isinstance(schema["cards"], list):
        _fatal("Schema missing required 'cards' array")

    meta = schema["meta"]
    for field in REQUIRED_META_FIELDS:
        if field not in meta:
            _fatal(f"meta missing required field: {field}")

    bucket_ids = meta.get("bucket_ids", {})
    if not isinstance(bucket_ids, dict):
        _fatal("meta.bucket_ids must be an object")

    for i, card in enumerate(schema["cards"]):
        missing = REQUIRED_CARD_FIELDS - set(card.keys())
        if missing:
            _fatal(f"Card {i} (id={card.get('id','?')}) missing fields: {missing}")

        if card["priority"] not in PRIORITY_MAP:
            _fatal(f"Card {card['id']}: priority must be High/Medium/Low, got: {card['priority']!r}")

        if card["bucket"] not in bucket_ids:
            _fatal(f"Card {card['id']}: bucket {card['bucket']!r} not in meta.bucket_ids")

        if contains_html(card["description"]):
            _fatal(f"Card {card['id']}: description contains HTML tags. Use plain text or Gherkin only.")

        if not isinstance(card.get("blocks", []), list):
            _fatal(f"Card {card['id']}: 'blocks' must be an array")


def _fatal(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------


def api_call(token: str, method: str, path: str, body: Any = None) -> dict:
    """
    Make an authenticated Vikunja API call.

    - Retries up to MAX_RETRIES times on connection errors (ConnectionError, Timeout).
    - Fails immediately on HTTP 4xx/5xx.
    """
    url = BASE_URL + path
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    for attempt in range(MAX_RETRIES + 1):
        try:
            resp = requests.request(method, url, json=body, headers=headers, timeout=10)
            if resp.status_code >= 400:
                _fatal(f"HTTP {resp.status_code} on {method} {path}: {resp.text[:300]}")
            return resp.json()
        except (ConnectionError, Timeout) as exc:
            if attempt == MAX_RETRIES:
                _fatal(f"Connection failed after {MAX_RETRIES + 1} attempts on {method} {path}: {exc}")
            wait = RETRY_BACKOFF_BASE ** attempt
            log.warning("  RETRY %d/%d in %ds: %s", attempt + 1, MAX_RETRIES, wait, exc)
            time.sleep(wait)

    # Should never reach here
    _fatal(f"Unexpected exit from retry loop on {method} {path}")


# ---------------------------------------------------------------------------
# Label resolution
# ---------------------------------------------------------------------------


def resolve_or_create_label(token: str, project_id: int, label_name: str) -> int:
    """Find label by name in the project, or create it. Returns label_id."""
    encoded = urllib.parse.quote(label_name, safe="")
    labels = api_call(token, "GET", f"/labels?s={encoded}&limit=50")
    if isinstance(labels, list):
        for lbl in labels:
            if lbl.get("title", "").lower() == label_name.lower():
                log.info("  Label '%s' found: id=%s", label_name, lbl["id"])
                return lbl["id"]

    log.info("  Label '%s' not found — creating", label_name)
    created = api_call(token, "PUT", "/labels", {"title": label_name})
    label_id = created.get("id")
    if not label_id:
        _fatal(f"Failed to create label '{label_name}': {created}")
    log.info("  Label '%s' created: id=%s", label_name, label_id)
    return label_id


# ---------------------------------------------------------------------------
# User resolution
# ---------------------------------------------------------------------------


def resolve_users(token: str, names: list[str]) -> dict[str, int]:
    """Returns dict: name_lower → user_id."""
    result = {}
    for name in set(names):
        if not name:
            continue
        encoded = urllib.parse.quote(name, safe="")
        users = api_call(token, "GET", f"/users?s={encoded}")
        if isinstance(users, list) and users:
            result[name.lower()] = users[0]["id"]
            log.info("  User '%s' → id=%s", name, users[0]["id"])
        else:
            log.warning("  WARN: user '%s' not found, skipping assignment", name)
    return result


# ---------------------------------------------------------------------------
# Card creation
# ---------------------------------------------------------------------------


def create_card(
    token: str,
    project_id: int,
    bucket_ids: dict,
    label_id: int,
    users: dict,
    card: dict,
) -> int:
    """Create a single card and return its Vikunja task ID."""
    body = {
        "title": card["title"],
        "description": card["description"],
        "bucket_id": bucket_ids[card["bucket"]],
        "priority": PRIORITY_MAP[card["priority"]],
    }
    task = api_call(token, "PUT", f"/projects/{project_id}/tasks", body)
    task_id = task.get("id")
    if not task_id:
        _fatal(f"Card {card['id']}: task creation returned no id: {task}")

    # Assign user (unconditional — always present)
    assignee_key = card["assigned_to"].lower()
    user_id = users.get(assignee_key)
    if user_id:
        api_call(token, "PUT", f"/tasks/{task_id}/assignees", {"user_id": user_id})
    else:
        log.warning("  WARN: card %s: assignee '%s' not resolved, skipping", card["id"], card["assigned_to"])

    # Apply label
    api_call(token, "PUT", f"/tasks/{task_id}/labels", {"label_id": label_id})

    return task_id


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <schema.json>", file=sys.stderr)
        sys.exit(1)

    schema_path = sys.argv[1]
    setup_logging()

    # 1. Load and validate schema
    try:
        with open(schema_path) as f:
            schema = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        _fatal(f"Cannot load schema {schema_path}: {exc}")

    validate_schema(schema)
    log.info("Schema loaded and validated: %d cards", len(schema["cards"]))

    # 2. Load token
    token = get_token()

    # 3. Read IDs from meta — no runtime API resolution
    meta = schema["meta"]
    project_id: int = meta["vikunja_project_id"]
    bucket_ids: dict = meta["bucket_ids"]
    log.info("Project id=%s | Buckets: %s", project_id, list(bucket_ids.keys()))

    # 4. Resolve or create label (all cards share the same label)
    label_name = schema["cards"][0]["label"]
    label_id = resolve_or_create_label(token, project_id, label_name)

    # 5. Resolve users
    assignee_names = [c["assigned_to"] for c in schema["cards"]]
    users = resolve_users(token, assignee_names)

    # 6. PASS 1 — create all cards, build id map
    log.info("\nCreating cards (pass 1)...")
    id_map: dict[str, int] = {}
    for card in schema["cards"]:
        vikunja_id = create_card(token, project_id, bucket_ids, label_id, users, card)
        id_map[card["id"]] = vikunja_id
        log.info("IMPORTED: %s → Vikunja task %s", card["id"], vikunja_id)

    # 7. PASS 2 — set blocking relations
    log.info("\nSetting blocking relations (pass 2)...")
    relations_set = 0
    for card in schema["cards"]:
        for blocked_logical_id in card.get("blocks", []):
            blocker_vikunja_id = id_map.get(card["id"])
            blocked_vikunja_id = id_map.get(blocked_logical_id)
            if not blocker_vikunja_id or not blocked_vikunja_id:
                log.warning(
                    "  WARN: cannot set %s blocks %s — one or both not in id_map",
                    card["id"], blocked_logical_id,
                )
                continue
            api_call(
                token, "PUT", f"/tasks/{blocker_vikunja_id}/relations",
                {"other_task_id": blocked_vikunja_id, "relation_kind": "blocking"},
            )
            log.info("  %s[%s] blocks %s[%s]", card["id"], blocker_vikunja_id, blocked_logical_id, blocked_vikunja_id)
            relations_set += 1

    # 8. Summary log
    spec_name = Path(schema_path).name
    log.info("IMPORT COMPLETE: %d cards from %s", len(schema["cards"]), spec_name)

    # 9. Human-readable output
    print(f"\nImport complete: {len(schema['cards'])} cards created, {relations_set} relations set.")
    print("\nCard mapping:")
    for logical_id, vikunja_id in id_map.items():
        print(f"  {logical_id} → Vikunja task {vikunja_id}")


if __name__ == "__main__":
    main()
