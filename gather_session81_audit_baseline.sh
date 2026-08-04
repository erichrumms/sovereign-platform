#!/usr/bin/env bash
# gather_session81_audit_baseline.sh
# Governance Agent — reference-material gather script for the Session 81
# platform-wide agent-plumbing audit.
#
# Different purpose than prior gather scripts tonight: this audit's job is to find
# things not yet known, so it can't be handed a curated "files to edit" list. This
# instead loads the small set of REFERENCE material needed to judge findings against:
# the one proven-correct guard pattern, the two files already fixed in Session 80 (as
# a "what correct looks like" example), and the known baseline of 10 already-instrumented
# call sites (docs/31) to compare a broader sweep against.
#
# Run from repo root: ~/Developer/sovereign-platform

set -uo pipefail

FILES=(
  "sovereign-api-client/src/ollama-endpoint.ts"
  "sovereign-api-client/src/base-client.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "docs/31_TCO_Token_Cost_Telemetry.md"
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

echo "=== Gather script complete (Session 81 audit baseline) ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo "Missing:"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded. Paste into Claude Code as the first message, before the opening"
echo "prompt. This is reference material only — the actual sweep uses Build Agent's own"
echo "search tools across the whole repo, not this file list."

rm -f "$OUT"
