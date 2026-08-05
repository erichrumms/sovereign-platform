#!/usr/bin/env bash
# gather_session88_f5_advisory_panels.sh
# Governance Agent — gather script for Session 88 (GD-35): F5 from the Session 86
# reflection — instrument the three untracked advisory PPBE panels with the same
# hook pattern, Gate 2 protection, and full field set (duration_ms, stop_reason,
# fallback_category) as every other live-call site on the platform.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SESSION_86_COST_TRACKING_REFLECTION.md"
  "module-scribe/src/PPBEExhibitPanel.tsx"
  "module-nexus/src/PPBECoordinationPanel.tsx"
  "module-apex/src/PPBEAgentsPanel.tsx"
  "module-vigil/src/useApprovalBrief.ts"
  "shell-contract.ts"
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

echo "=== Gather script complete (Session 88 / F5) ==="
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
