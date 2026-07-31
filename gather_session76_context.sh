#!/bin/bash
FILES=(
  "SOVEREIGN_Platform_Integration_Brief_v1.55.md"
  "AGENT_REFERENCE.md"
  "SOVEREIGN_Walkthrough_I_Findings_Report_20260730.md"
  "SOVEREIGN_Walkthrough_I.md"
  "docs/13_APEX_Architecture.md"
  "docs/23_Reviewers_Workspace_v1.md"
  "docs/17_TimeAndTravel_Architecture.md"
  "shell-contract.ts"
  "sovereign-shell/shell-contract.ts"
)

OUTPUT=""
FOUND=0
MISSING=()

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    OUTPUT+=$'\n\n'"===== FILE: $f ====="$'\n\n'
    OUTPUT+="$(cat "$f")"
    FOUND=$((FOUND+1))
  else
    MISSING+=("$f")
  fi
done

echo "$OUTPUT" | pbcopy

TOTAL=${#FILES[@]}
echo "$FOUND of $TOTAL files found. ${#MISSING[@]} missing."
if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Missing files:"
  for m in "${MISSING[@]}"; do
    echo "  - $m"
  done
fi
echo "Context copied to clipboard."
