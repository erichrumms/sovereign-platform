#!/bin/bash
# SOVEREIGN Platform — Session 30 Context Gather Script
# Time & Travel fix session — scoped by Walkthrough_E2_Findings_Record.md:
# WE-10 (travel drafting pipeline, priority), WE-11/WE-12 (decision-note UX),
# WE-7 (landing/status page), WE-4 (docs/19 verification)

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.41.md"
  "docs/17_TimeAndTravel_Architecture.md"
  "docs/19_TT_Navigation_Reference.md"
  "docs/Walkthrough_E_Findings_Record.md"
  "docs/Walkthrough_E2_Findings_Record.md"
  "SOVEREIGN_Session29_Handoff.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/entities/travel-request.ts"
  "sovereign-data/src/entities/correction-record.ts"
  "module-nexus/src/tt-travel-compliance-engine.ts"
  "module-nexus/src/tt-travel-router.ts"
  "module-nexus/src/tt-travel-queue.ts"
  "module-vigil/src/tt-escalation-monitor.ts"
  "module-vigil/src/tt-alert-routing.ts"
  "module-vigil/src/tt-escalation-gate.ts"
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
OUTPUT+='DISCOVERY SCAN — the NEXUS travel decision component (WE-10 headline target)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rln 'recordTravelDecision\|TRAVEL_APPROVAL' "$REPO/module-nexus/src" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — decision note field / input component (WE-11/WE-12)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(grep -rln 'Decision note\|min 10 chars\|decisionNote' "$REPO/module-nexus/src" "$REPO/module-vigil/src" 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — app shell / home / landing route (WE-7)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/sovereign-shell/src" -maxdepth 2 -iname '*home*' -o -iname '*landing*' -o -iname '*dashboard*' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='GIT STATE\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(cd "$REPO" && git log --oneline -10 2>/dev/null)"
OUTPUT+=$'\n---\n'
OUTPUT+="$(cd "$REPO" && git status --short 2>/dev/null)"

echo "$OUTPUT" | pbcopy

echo ""
echo "Session 30 context package — gathered"
echo "$found of ${#exact_files[@]} exact files found, $missing missing"
echo "Discovery scan included for: travel decision component, decision-note field, app shell/landing route, git state"
echo "Output copied to clipboard — paste into Claude Code after the opening prompt."
if [ "$missing" -gt 0 ]; then
  echo ""
  echo "!!! $missing file(s) missing — resolve before opening the session, don't proceed blind."
fi
