#!/usr/bin/env bash
# gather_session83_cleanup_flowpath.sh
# Governance Agent — gather script for Session 83: remove the Session 80 debug gates,
# fix ConsoleClientLogger's browser-unsafe production check, and apply Gate 2
# protection to FLOWPATH's useFlowpathElicitation.ts for platform-wide consistency.
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "SESSION_82_HANDOFF.md"
  "sovereign-api-client/src/base-client.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "module-vigil/src/anthropic-key.ts"
  "module-scribe/src/useDraft.ts"
  "module-flowpath/src/useFlowpathElicitation.ts"
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

echo "=== Gather script complete (Session 83) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. Build Agent should find FLOWPATH's real calling/consuming context itself,"
echo "not assume it from this file list."

rm -f "$OUT"
