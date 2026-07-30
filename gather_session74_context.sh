#!/bin/bash
FILES=(
  "SOVEREIGN_Platform_Integration_Brief_v1.53.md"
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "AGENT_REFERENCE.md"
  "SOVEREIGN_Walkthrough_H_Findings_Resolution_Log_Addendum_3_20260729.md"
  "docs/13_APEX_Architecture.md"
  "docs/18_PPBE_Workflow_Architecture.md"
  "02_SCRIBE_Drafting_Workspace.md"
  "docs/21_WorkQueueSurface.md"
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
