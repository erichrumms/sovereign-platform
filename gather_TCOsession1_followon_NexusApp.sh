#!/usr/bin/env bash
# gather_TCOsession1_followon_NexusApp.sh
# Governance Agent — Follow-on to GD-31 Build Session 1: close the NexusApp
# convergence-test gap disclosed in the session Handoff.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "module-nexus/src/NexusApp.tsx"
  "module-vigil/src/useApprovalBrief.ts"
  "module-vigil/tests/useApprovalBrief.test.tsx"
  "module-scribe/src/useTTDraft.ts"
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
LINES=$(wc -l < "$OUT" | tr -d ' ')

cat "$OUT" | pbcopy

echo "=== Gather script complete (follow-on) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing. Total: $LINES lines."
if [ $MISSING -gt 0 ]; then
  echo ""
  echo "Missing — every one of these is a real gap:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded with $FOUND file(s). Paste into Claude Code as the first message,"
echo "before the opening prompt."

rm -f "$OUT"
