#!/usr/bin/env bash
# gather_session95_rule_formalization.sh
# Governance Agent — gather script for Session 95: implementing an explicit,
# authorized governance decision (not a Build Agent judgment call) formalizing
# Rules 11-13, resolving the Rule 17 scope question, fixing the phantom
# cross-reference, and correcting docs/36's citations.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SOVEREIGN_Session94_Handoff.md"
  "AGENT_REFERENCE.md"
  "docs/36_Router_Inspection_Audit_Process.md"
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

echo "=== Gather script complete (Session 95) ==="
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
