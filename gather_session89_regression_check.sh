#!/usr/bin/env bash
# gather_session89_regression_check.sh
# Governance Agent — reference-material gather script for Session 89: a targeted
# e2e regression pass across module interworking, key usage, reporting, and
# Reviewer's Workspace links — verifying nothing broke as a side effect of the
# extensive shared-code changes across Sessions 80-88.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
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

echo "=== Gather script complete (Session 89 regression check) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. This is minimal reference material — the real e2e suite needs enumerating"
echo "and running directly, not pre-loaded here."

rm -f "$OUT"
