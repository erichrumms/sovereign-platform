#!/bin/bash
FILES=(
  "SOVEREIGN_Platform_Integration_Brief_v1.51.md"
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "AGENT_REFERENCE.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Findings_Report_20260728.md"
  "SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_Addendum_20260728.md"
  "SESSION_71_HANDOFF.md"
  "shell-contract.ts"
  "sovereign-shell/shell-contract.ts"
  "docs/13_APEX_Architecture.md"
  "docs/12_NEXUS_Architecture.md"
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
