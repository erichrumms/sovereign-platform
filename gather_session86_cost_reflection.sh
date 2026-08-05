#!/usr/bin/env bash
# gather_session86_cost_reflection.sh
# Governance Agent — reference-material gather script for Session 86: reflecting on
# what routine/regular data collection should be added to cost tracking, informed by
# Sessions 80-85's deep investigation into the real agent-call infrastructure.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "docs/31_TCO_Token_Cost_Telemetry.md"
  "docs/32_SysAdmin_Cost_Dashboard.md"
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

echo "=== Gather script complete (Session 86 reflection) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. This is the current-state baseline only — Build Agent should read the real"
echo "implementation and its own memory of Sessions 80-85 for the actual reflection."

rm -f "$OUT"
