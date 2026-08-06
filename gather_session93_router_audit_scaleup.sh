#!/usr/bin/env bash
# gather_session93_router_audit_scaleup.sh
# Governance Agent — gather script for Session 93: three pieces from the Router
# Inspection & Audit Process proposal — extend Check 7's parity-test pattern to all
# seven Workspace tabs, document a shell-contract-bump trigger convention, and add
# a real Audit Status banner to Cost Dashboard.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "Router_Inspection_Audit_Process.md"
  "module-workspace/src/WorkspaceApp.tsx"
  "e2e/tests/nexus-flowpath-workspace-convergence.test.tsx"
  "AGENT_REFERENCE.md"
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

echo "=== Gather script complete (Session 93) ==="
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
