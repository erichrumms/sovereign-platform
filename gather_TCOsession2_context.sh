#!/usr/bin/env bash
# gather_TCOsession2_context.sh
# Governance Agent — Context Gather Script for Build Session 2 (docs/32,
# SysAdmin Cost Dashboard)
# Run from repo root: ~/Developer/sovereign-platform
#
# Kept lean deliberately, per the lesson from Session 1's v1 gather script (which
# exhausted Claude Code's context before any real work started): only docs/32 itself,
# the one file being modified (already contains the existing Activity tab pattern and
# the existing SYSTEM_ADMIN/PLATFORM_ADMIN gating this session reuses), the shell
# contract (for the real token_usage-bearing event shape, now live at v1.25), and the
# existing test file. AGENT_REFERENCE.md and CLAUDE.md are deliberately NOT pasted —
# Build Agent has real file access and can read them directly if it needs a specific
# rule, per the same fix applied last session.

set -uo pipefail

FILES=(
  "docs/32_SysAdmin_Cost_Dashboard.md"
  "module-workspace/src/WorkspaceApp.tsx"
  "shell-contract.ts"
  "module-workspace/tests/WorkspaceApp.test.tsx"
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

echo "=== Gather script complete (Session 2) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing. Total: $LINES lines."
if [ $MISSING -gt 0 ]; then
  echo ""
  echo "Missing — every one of these is a real gap, no expected misses this time:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded with $FOUND file(s). Paste into Claude Code as the first message,"
echo "before the opening prompt."

rm -f "$OUT"
