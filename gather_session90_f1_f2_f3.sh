#!/usr/bin/env bash
# gather_session90_f1_f2_f3.sh
# Governance Agent — gather script for Session 90: close out Session 89's findings.
# F1 (permanent e2e test for NEXUS/FLOWPATH Workspace links) and F3 (docs/23 wording)
# get built/fixed directly. F2 (missing deployment_feedback, pre-existing since June)
# gets investigated first, not blindly fixed or silenced.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SESSION_89_REGRESSION_VERIFICATION.md"
  "docs/23_Reviewers_Workspace_v1.md"
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

echo "=== Gather script complete (Session 90) ==="
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
