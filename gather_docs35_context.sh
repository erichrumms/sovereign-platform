#!/usr/bin/env bash
# gather_docs35_context.sh
# Governance Agent — Context Gather Script for docs/35 (Program & Staff Data Foundation)
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "docs/35_Program_Staff_Data_Foundation.md"
  "shell-contract.ts"
  "sovereign-data/src/entities/program.ts"
  "sovereign-data/src/entities/program-record.ts"
  "sovereign-data/src/entities/travel-request.ts"
  "sovereign-data/src/entities/time-record.ts"
  "module-apex/src/apex-contract.ts"
  "sovereign-data/src/synthetic/ppbe-seed.ts"
  "module-apex/src/synthetic-world-model.ts"
  "module-apex/src/tt-synthetic-config.ts"
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
LINES=$(wc -l < "$OUT" | tr -d ' ')

cat "$OUT" | pbcopy

echo "=== Gather script complete (docs/35) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing. Total: $LINES lines."
if [ $MISSING -gt 0 ]; then
  echo ""
  echo "Missing — every one of these is a real gap:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded with $FOUND file(s). Paste into Claude Code as the first message,"
echo "before the opening prompt."

rm -f "$OUT"
