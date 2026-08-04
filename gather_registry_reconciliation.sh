#!/usr/bin/env bash
# gather_registry_reconciliation.sh
# Governance Agent — gather script for reconciling GD Registry + DOCUMENT_MANIFEST
# against tonight's real, confirmed work (GD-31/32/33, folded into Session 77/78/79)
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SOVEREIGN_GD_Registry_20260730.md"
  "DOCUMENT_MANIFEST.tsv"
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

echo "=== Gather script complete (registry reconciliation) ==="
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
