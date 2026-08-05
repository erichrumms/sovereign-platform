#!/usr/bin/env bash
# gather_session87_cost_fields.sh
# Governance Agent — gather script for Session 87: F1 (failure categorization),
# F2 (duration_ms), F3 (stop_reason/truncation), F6b (responded_at forwarding) —
# all small, all extending existing fields, bundled into one shell-contract bump
# per Build Agent's own Session 86 recommendation.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SESSION_86_COST_TRACKING_REFLECTION.md"
  "sovereign-api-client/src/base-client.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "module-vigil/src/useApprovalBrief.ts"
  "shell-contract.ts"
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

echo "=== Gather script complete (Session 87) ==="
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
