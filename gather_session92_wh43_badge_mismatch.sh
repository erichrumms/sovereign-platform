#!/usr/bin/env bash
# gather_session92_wh43_badge_mismatch.sh
# Governance Agent — gather script for Session 92: a live, user-confirmed mismatch
# between the Reviewer's Workspace NEXUS Travel tab badge (shows 5) and the actual
# item count in both NEXUS's own Travel & Time Queue and the Workspace panel's own
# rendered list (both show 4). This is the opposite direction from the original
# WH-43 root cause (under-counting) — treat as a real, possibly distinct defect,
# not assumed to be the same bug recurring.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "module-workspace/src/WorkspaceApp.tsx"
  "module-nexus/src/NexusApp.tsx"
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

echo "=== Gather script complete (Session 92) ==="
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
