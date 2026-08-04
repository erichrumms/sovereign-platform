#!/usr/bin/env bash
# gather_session82_gate2_audit_fix.sh
# Governance Agent — gather script for Session 82: fix F1 + F2 from the Session 81
# audit, plus verify Gate 2 (fail-closed try-catch protection) is genuinely present,
# not just claimed, at all 18 real live-call sites.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SESSION_81_HANDOFF.md"
  "module-nexus/src/NexusApp.tsx"
  "module-scribe/src/useDraft.ts"
  "e2e/tests/startup-publish-convergence.test.ts"
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

echo "=== Gather script complete (Session 82) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. SESSION_81_HANDOFF.md's Part 2 table lists all 18 sites by file:line —"
echo "Build Agent should read each one directly for the Gate 2 verification, not rely"
echo "on this gather script's file list alone."

rm -f "$OUT"
