#!/usr/bin/env bash
# gather_TCOsession1_context_v2.sh
# Governance Agent — Context Gather Script for Build Session 1 (docs/31), v2
# Run from repo root: ~/Developer/sovereign-platform
#
# v2 change: dropped the duplicate shell-contract.ts copy (both are supposed to be
# identical — pasting both wastes space for zero new information) and AGENT_REFERENCE.md
# (1,994 lines of mostly project history; Build Agent has real file access and can read
# it directly if it needs a specific rule, rather than needing it force-fed up front).
# v1 hit Claude Code's context limit before any real work started — this version keeps
# only the source files Build Agent would otherwise need many separate tool calls to
# locate: the real technical payload of this build.

set -uo pipefail

FILES=(
  "shell-contract.ts"
  "sovereign-shell/src/shell.ts"
  "sovereign-api-client/src/base-client.ts"
  "sovereign-api-client/src/anthropic-client.ts"
  "sovereign-api-client/src/govcloud-client.ts"
  "module-vigil/src/useApprovalBrief.ts"
  "module-vigil/tests/useApprovalBrief.test.tsx"
  "module-vigil/src/useTriage.ts"
  "module-vigil/src/security-query.ts"
  "module-scribe/src/useTTDraft.ts"
  "module-scribe/src/useDraft.ts"
  "module-scribe/src/useStyleProfile.ts"
  "module-scribe/src/useIntermediate.ts"
  "module-nexus/src/tt-travel-queue.ts"
  "module-nexus/src/useTTIntake.ts"
  "module-nexus/src/NexusApp.tsx"
  "module-cpmi/src/useBenchmark.ts"
  "module-cpmi/src/useReasoningChain.ts"
  "module-lens/src/useExplanation.ts"
  "module-counsel/src/useAnalysis.ts"
  "module-counsel/src/usePreMortem.ts"
  "module-counsel/src/useCounterargument.ts"
  "module-aria/src/tracer-integration.ts"
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

echo "=== Gather script complete (v2) ==="
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
