#!/usr/bin/env bash
# gather_session94_docs36_rule_citations.sh
# Governance Agent — gather script for Session 94: locate the real source (if any) of
# the principles docs/36 cites as "Rules 11-14," and correct the citations — or, if
# the principles are real but never formalized, propose (don't unilaterally add)
# formal rule numbers, following the same precedent as Rules 15-17.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "docs/36_Router_Inspection_Audit_Process.md"
  "AGENT_REFERENCE.md"
  "Agent_Identity_Standard.md"
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

echo "=== Gather script complete (Session 94) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. A repo-wide search beyond these 3 files will likely be needed — this is a"
echo "starting point, not the full file list."

rm -f "$OUT"
