#!/usr/bin/env bash
# gather_session85_diagnostic.sh
# Governance Agent — reference-material gather script for Session 85 (root-cause
# investigation: why no live call has succeeded despite four verified fixes).
#
# Same purpose as the Session 81 audit's gather script: a small starting point, not
# a full file list. The actual investigation (dev server state, caching, live API
# key test, model validity, config flags) needs Build Agent's own broad search — this
# just hands over the two files already touched tonight (one has the cache logic and
# the stray console.log to remove; the other has Session 84's header fix to confirm
# is really there) plus build config and the most recent real Handoff for context.
#
# Deliberately NOT included: sovereign-shell/.env.local (the real API key file).
# Build Agent should read that itself, directly, when it gets to the curl test — not
# have it pasted into this session's transcript unnecessarily.
#
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "module-vigil/src/useApprovalBrief.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "sovereign-shell/vite.config.ts"
  "SOVEREIGN_Session84_Handoff.md"
)

OUT=$(mktemp)
FOUND=0
MISSING=0
MISSING_LIST=()

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    {
      echo "=================================================================="
      echo "FILE: $f"
      echo "=================================================================="
      cat "$f"
      echo ""
    } >> "$OUT"
    FOUND=$((FOUND+1))
  else
    MISSING=$((MISSING+1))
    MISSING_LIST+=("$f")
  fi
done

TOTAL=${#FILES[@]}
cat "$OUT" | pbcopy

echo "=== Gather script complete (Session 85 diagnostic) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. The real investigation uses Build Agent's own search/read tools broadly —"
echo "this is a starting point, not the file list."

rm -f "$OUT"
