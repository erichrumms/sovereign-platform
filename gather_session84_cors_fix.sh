#!/usr/bin/env bash
# gather_session84_cors_fix.sh
# Governance Agent — gather script for fixing the CORS block on direct
# browser-to-Anthropic API calls (missing anthropic-dangerous-direct-browser-access
# header), confirmed live via browser console: "Preflight response is not
# successful. Status code: 400."
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "sovereign-api-client/src/anthropic-client.ts"
  "sovereign-api-client/src/base-client.ts"
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

echo "=== Gather script complete (Session 84 CORS fix) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening prompt."

rm -f "$OUT"
