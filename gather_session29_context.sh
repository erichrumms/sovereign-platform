#!/bin/bash
# SOVEREIGN Platform — Session 29 Context Gather Script
# Time & Travel gap fixes, scoped by Walkthrough_E_Findings_Record.md:
# TT intake form (NEXUS), platform-wide Gap 3 contrast audit, TT synthetic
# data seeding, architecture/navigation reference
#
# CONFIDENCE NOTE: TT-specific paths are high-confidence (confirmed via the
# actual Session 27/28 SBOMs). The contrast-audit and NEXUS-dropdown paths are
# NOT confirmed — this session touches UI/styling code not previously read in
# any gather script. Discovery scan covers those rather than guessing.

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.41.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-data/src/entities/travel-policy.ts"
  "sovereign-data/src/entities/travel-request.ts"
  "sovereign-data/src/entities/time-record.ts"
  "sovereign-data/src/entities/charge-account.ts"
  "sovereign-data/src/entities/compliance-flag.ts"
  "sovereign-data/src/entities/correction-record.ts"
  "docs/17_TimeAndTravel_Architecture.md"
  "docs/Walkthrough_E_Findings_Record.md"
  "SOVEREIGN_Session28_Handoff.md"
  "module-nexus/src/index.ts"
  "module-nexus/src/tt-travel-compliance-engine.ts"
  "module-nexus/src/tt-travel-router.ts"
  "module-nexus/src/tt-travel-queue.ts"
  "module-vigil/src/index.ts"
  "module-vigil/src/tt-escalation-monitor.ts"
  "module-vigil/src/tt-alert-routing.ts"
  "module-vigil/src/tt-escalation-gate.ts"
  "module-apex/src/tt-time-compliance-engine.ts"
  "module-apex/src/tt-pattern-analyst.ts"
  "module-apex/src/tt-audit-reporter.ts"
  "module-scribe/src/tt-draft-contract.ts"
  "module-scribe/src/tt-draft-engine.ts"
  "module-scribe/src/useTTDraft.ts"
  "module-scribe/src/TTManagerReview.tsx"
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
OUTPUT+='DISCOVERY SCAN — NEXUS request-type dropdown / intake form component\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rl 'DOCUMENT_REVIEW\|request-type\|requestType' "$REPO/module-nexus/src" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — is the NEXUS request-type field shell-governed?\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -n 'RequestType\|WorkRequestType' "$REPO/sovereign-shell/shell-contract.ts" "$REPO/shell-contract.ts" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — theme / color token / contrast-relevant styling files\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO" -maxdepth 3 -iname '*theme*' -o -iname '*tokens*' -o -iname '*colors*' 2>/dev/null | grep -v node_modules)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — existing seed-data patterns (APEX P-100, VIGIL alerts) to match convention\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rl 'P-100\|seed\|SYNTH-' "$REPO/module-apex/src" "$REPO/module-vigil/src" 2>/dev/null | grep -v test)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='GIT STATE\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(cd "$REPO" && git log --oneline -10 2>/dev/null)"
OUTPUT+=$'\n---\n'
OUTPUT+="$(cd "$REPO" && git status --short 2>/dev/null)"

echo "$OUTPUT" | pbcopy

echo ""
echo "Session 29 context package — gathered"
echo "$found of ${#exact_files[@]} exact files found, $missing missing"
echo "Discovery scan included for: NEXUS intake component, shell-contract RequestType governance, theme/contrast files, existing seed-data patterns, git state"
echo "Output copied to clipboard — paste into Claude Code after the opening prompt."
if [ "$missing" -gt 0 ]; then
  echo ""
  echo "!!! $missing file(s) missing — resolve before opening the session, don't proceed blind."
fi
