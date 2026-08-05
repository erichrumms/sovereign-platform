#!/usr/bin/env bash
# gather_session91_supervisor_role.sh
# Governance Agent — gather script for Session 91: add the SUPERVISOR role (docs/34
# Phase 3, deferred since Session 79), reassign the 8 GD-33 Supervisor employees off
# their INDEPENDENT_REVIEWER placeholder, and grant FLOWPATH access.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "shell-contract.ts"
  "sovereign-data/src/synthetic/staff-seed.ts"
  "module-flowpath/src/FlowpathApp.tsx"
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

echo "=== Gather script complete (Session 91) ==="
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
