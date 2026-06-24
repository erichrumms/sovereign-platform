#!/bin/bash
# =============================================================
# SOVEREIGN Platform — Session 13 Context Gather Script
# Session 13 focus: Local LLM Infrastructure (autonomous)
# Provider B, Ollama adapter, routing logic, model registry
# =============================================================

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-api-client/src/index.ts"
  "sovereign-api-client/src/client.ts"
  "sovereign-api-client/package.json"
  "docs/06_LocalLLM_Architecture.md"
  "docs/07_LocalLLM_Decision_Framework.md"
  "docs/10_LocalLLM_Infrastructure.md"
)

OUTPUT=""

header() {
  printf '\n================================================================\n'
  printf 'FILE: %s\n' "$1"
  printf '================================================================\n'
}

missing=0
found=0

for rel in "${exact_files[@]}"; do
  abs="$REPO/$rel"
  if [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING (exact path): $rel"$'\n'
    missing=$((missing + 1))
  fi
done

total=$((found + missing))
SUMMARY=$'\n'"================================================================"
SUMMARY+=$'\n'"SESSION 13 CONTEXT PACKAGE — $(date)"
SUMMARY+=$'\n'"$found of $total files found. $missing missing."
SUMMARY+=$'\n'"================================================================"

FULL_OUTPUT="$SUMMARY"$'\n'"$OUTPUT"$'\n'"$SUMMARY"

echo "$FULL_OUTPUT"
echo "$FULL_OUTPUT" | pbcopy
echo ""
echo ">>> Output copied to clipboard. Paste into Claude Code."
if [ "$missing" -gt 0 ]; then
  echo ">>> WARNING: $missing file(s) were not found."
fi
