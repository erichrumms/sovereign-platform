#!/bin/bash
# SOVEREIGN Platform — Session 28 Context Gather Script
# Time & Travel Phase II / Full Cycle — drafting agents live, VIGIL/NEXUS wiring,
# end-to-end integration test
#
# CONFIDENCE NOTE: the exact_files list below is built from the actual Session 27
# SBOM update and handoff (paths confirmed, not guessed, unlike Session 27's own
# gather script). module-scribe internals and the exact VIGILAlert schema location
# are NOT confirmed — the discovery scan below surfaces those rather than guessing.

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.41.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-data/src/index.ts"
  "sovereign-data/src/entities/travel-policy.ts"
  "sovereign-data/src/entities/travel-request.ts"
  "sovereign-data/src/entities/time-record.ts"
  "sovereign-data/src/entities/charge-account.ts"
  "sovereign-data/src/entities/compliance-flag.ts"
  "sovereign-data/src/entities/correction-record.ts"
  "sovereign-api-client/src/index.ts"
  "sovereign-api-client/src/routing.ts"
  "sovereign-api-client/src/routed-inference.ts"
  "docs/17_TimeAndTravel_Architecture.md"
  "tt/prompts/travel_drafting_system.md"
  "tt/prompts/time_drafting_system.md"
  "tt/prompts/CHANGELOG.md"
  "module-nexus/src/tt-travel-compliance-engine.ts"
  "module-nexus/src/tt-travel-router.ts"
  "module-nexus/src/index.ts"
  "module-apex/src/tt-time-compliance-engine.ts"
  "module-apex/src/tt-pattern-analyst.ts"
  "module-apex/src/tt-audit-reporter.ts"
  "module-apex/src/index.ts"
  "module-vigil/src/tt-escalation-monitor.ts"
  "module-vigil/src/index.ts"
  "SOVEREIGN_Session27_Handoff.md"
)

header() {
  printf '\n================================================================\n'
  printf 'FILE: %s\n' "$1"
  printf '================================================================\n'
}

OUTPUT=""
missing=0
found=0

for rel in "${exact_files[@]}"; do
  abs="$REPO/$rel"
  if [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING: $rel"$'\n'
    missing=$((missing + 1))
  fi
done

# --- DISCOVERY SCAN ---
OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — module-scribe source (drafting agents wire in here)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/module-scribe" -maxdepth 2 -type f -name '*.ts' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — VIGILAlert schema / sourceProduct usage\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rl 'VIGILAlert' "$REPO/module-vigil/src" "$REPO/sovereign-shell" 2>/dev/null)"
OUTPUT+=$'\n---\n'
OUTPUT+="$(grep -rn 'sourceProduct' "$REPO/module-vigil/src" "$REPO/sovereign-shell" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — HumanDecisionType definition (GD-21 target)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rn 'HumanDecisionType' "$REPO/sovereign-shell/shell-contract.ts" "$REPO/shell-contract.ts" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — SovereignProduct definition (TT-PRODUCT-GD context)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rn 'SovereignProduct' "$REPO/sovereign-shell/shell-contract.ts" "$REPO/shell-contract.ts" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='GIT STATE\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(cd "$REPO" && git log --oneline -8 2>/dev/null)"
OUTPUT+=$'\n---\n'
OUTPUT+="$(cd "$REPO" && git status --short 2>/dev/null)"

echo "$OUTPUT" | pbcopy

echo ""
echo "Session 28 context package — gathered"
echo "$found of ${#exact_files[@]} exact files found, $missing missing"
echo "Discovery scan included for: module-scribe, VIGILAlert/sourceProduct, HumanDecisionType, SovereignProduct, git state"
echo "Output copied to clipboard — paste into Claude Code after the opening prompt."
if [ "$missing" -gt 0 ]; then
  echo ""
  echo "!!! $missing file(s) missing — resolve before opening the session, don't proceed blind."
fi
