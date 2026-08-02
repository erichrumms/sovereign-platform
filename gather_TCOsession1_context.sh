#!/usr/bin/env bash
# gather_TCOsession1_context.sh
# Governance Agent — Context Gather Script for Build Session 1 (docs/31, Token & Cost Telemetry)
# Run from repo root: ~/Developer/sovereign-platform
#
# Per AGENT_REFERENCE.md's Context Gather Script convention: collects every file this
# session needs, concatenates with clear headers, copies to clipboard, reports found vs.
# missing. Confirm "0 missing" before pasting into Claude Code.
#
# NOTE on two candidate paths below (AGENT_REFERENCE.md / AGENT_REFERENCE_v3_5.md, and
# similarly for CLAUDE.md): the real filename in this repo was not independently
# confirmed before writing this script — per this document's own Lesson 11, guessed
# filenames get reported missing rather than silently skipped. Expect exactly one of
# each pair to show as missing; that is normal, not a bug. If BOTH show missing, the
# real filename differs from both guesses and needs to be found before proceeding.

set -uo pipefail

FILES=(
  "docs/31_TCO_Token_Cost_Telemetry.md"
  "AGENT_REFERENCE.md"
  "AGENT_REFERENCE_v3_5.md"
  "CLAUDE.md"
  "shell-contract.ts"
  "sovereign-shell/shell-contract.ts"
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

cat "$OUT" | pbcopy

echo "=== Gather script complete ==="
echo "$FOUND of $TOTAL files found. $MISSING missing."
if [ $MISSING -gt 0 ]; then
  echo ""
  echo "Missing (expected: one of AGENT_REFERENCE.md/AGENT_REFERENCE_v3_5.md, and one of"
  echo "CLAUDE.md if it lives elsewhere. Anything else missing here is a real gap to fix"
  echo "before proceeding):"
  for m in "${MISSING_LIST[@]}"; do
    echo "  - $m"
  done
fi
echo ""
echo "Clipboard loaded with $FOUND file(s). Paste into Claude Code as the first message,"
echo "before the opening prompt."

rm -f "$OUT"
