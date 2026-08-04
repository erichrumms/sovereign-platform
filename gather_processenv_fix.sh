#!/usr/bin/env bash
# gather_processenv_fix.sh
# Governance Agent — gather script for fixing the browser-compatibility bug
# ("process" undefined in-browser) blocking every live model call tonight.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "sovereign-api-client/src/base-client.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "sovereign-api-client/src/ollama-endpoint.ts"
  "module-vigil/src/anthropic-key.ts"
  "module-vigil/src/useApprovalBrief.ts"
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

echo "=== Gather script complete (process.env fix) ==="
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
