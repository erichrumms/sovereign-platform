#!/bin/bash
REPO="$HOME/Developer/sovereign-platform"
exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-api-client/src/routing.ts"
  "module-agentos/src/index.ts"
  "module-agentos/src/agentos-contract.ts"
  "module-agentos/src/approval-port.ts"
  "module-agentos/src/task-registry.ts"
  "module-agentos/src/agent-dispatcher.ts"
  "sovereign-shell/src/register-modules.ts"
  "docs/12_NEXUS_Architecture.md"
  "docs/11_AgentOS_Architecture.md"
)
OUTPUT=""; header() { printf '\n================================================================\nFILE: %s\n================================================================\n' "$1"; }
missing=0; found=0
for rel in "${exact_files[@]}"; do
  abs="$REPO/$rel"
  if [ -f "$abs" ]; then OUTPUT+="$(header "$rel"; cat "$abs"; echo)"; found=$((found+1))
  else OUTPUT+=$'\n'"!!! MISSING: $rel"$'\n'; missing=$((missing+1)); fi
done
total=$((found+missing))
SUMMARY=$'\n'"================================================================"$'\n'"SESSION 15 — $(date)"$'\n'"$found of $total found. $missing missing."$'\n'"================================================================"
FULL="$SUMMARY"$'\n'"$OUTPUT"$'\n'"$SUMMARY"
echo "$FULL"; echo "$FULL" | pbcopy
echo ">>> Copied to clipboard."; [ "$missing" -gt 0 ] && echo ">>> WARNING: $missing missing."
