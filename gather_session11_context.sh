#!/bin/bash
# SOVEREIGN Platform — Session 11 Context Gather Script
# Session 11 focus: CPMI Module (Stage 3)

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-shell/src/register-modules.ts"
  "docs/08_CPMI_Architecture.md"
)

doc_names=(
  "sovereign_data_CompanionSuite_Specification.md"
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

for name in "${doc_names[@]}"; do
  if [ -f "$REPO/$name" ]; then
    rel="$name"; abs="$REPO/$name"
  elif [ -f "$REPO/docs/$name" ]; then
    rel="docs/$name"; abs="$REPO/docs/$name"
  else
    abs=$(find "$REPO" -name "$name" 2>/dev/null | head -1)
    rel="${abs#$REPO/}"
  fi
  if [ -n "$abs" ] && [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING (searched whole repo): $name"$'\n'
    missing=$((missing + 1))
  fi
done

total=$((found + missing))
SUMMARY=$'\n'"================================================================"
SUMMARY+=$'\n'"SESSION 11 CONTEXT PACKAGE — $(date)"
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
