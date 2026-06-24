#!/bin/bash
# =============================================================
# SOVEREIGN Platform — Session 12 Context Gather Script
# Run in a second Terminal window before opening Claude Code.
# Session 12 focus: CPMI Stage 3 completion (autonomous)
# Gate 1/2 auto, benchmark suite, Gate 3 prep, world model wiring
# =============================================================

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-data/src/entities/reasoning-chain-output.ts"
  "module-cpmi/src/index.ts"
  "module-cpmi/src/cpmi-contract.ts"
  "module-cpmi/src/world-model-port.ts"
  "module-cpmi/src/reasoning-engine.ts"
  "module-cpmi/src/useReasoningChain.ts"
  "module-cpmi/src/gate-runner.ts"
  "module-cpmi/src/useGateRunner.ts"
  "module-cpmi/src/vrs-certification.ts"
  "module-cpmi/src/GateRunnerPanel.tsx"
  "module-cpmi/prompts/reasoning-chain-v1.0.md"
  "docs/08_CPMI_Architecture.md"
  "docs/09_CPMI_Stage3_Completion.md"
)

OUTPUT=""

header() {
  printf '\n================================================================\n'
  printf 'FILE: %s\n' "$1"
  printf '================================================================\n'
}

missing=0
found=0

for rel in "${exact_files[@]}"; do
  abs="$REPO/$rel"
  if [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING (exact path): $rel"$'\n'
    missing=$((missing + 1))
  fi
done

total=$((found + missing))
SUMMARY=$'\n'"================================================================"
SUMMARY+=$'\n'"SESSION 12 CONTEXT PACKAGE — $(date)"
SUMMARY+=$'\n'"$found of $total files found. $missing missing."
SUMMARY+=$'\n'"================================================================"

FULL_OUTPUT="$SUMMARY"$'\n'"$OUTPUT"$'\n'"$SUMMARY"

echo "$FULL_OUTPUT"
echo "$FULL_OUTPUT" | pbcopy
echo ""
echo ">>> Output copied to clipboard. Paste into Claude Code."
if [ "$missing" -gt 0 ]; then
  echo ">>> WARNING: $missing file(s) were not found. Review !!! MISSING lines above."
fi
