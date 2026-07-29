#!/bin/bash
FILES=(
  "SOVEREIGN_Platform_Integration_Brief_v1.52.md"
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "AGENT_REFERENCE.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Comprehensive_Audit_Synthesis_20260726.md"
  "SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_Addendum_2_20260728.md"
  "SOVEREIGN_FY2025_2028_PPBE_Content_Draft_20260727.md"
  "docs/03_LENS_Orientation_Module.md"
  "docs/11_AgentOS_Architecture.md"
  "docs/18_PPBE_Workflow_Architecture.md"
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
