#!/bin/bash
# SOVEREIGN Platform — Session 27 Context Gather Script
# Time & Travel Phase I / Core Integration — data dictionary registration,
# agent scaffolding
#
# NOTE ON THIS SCRIPT'S CONFIDENCE LEVEL:
# The "exact_files" list below is built from files explicitly named in the
# governing documents (Integration Brief v1.41, docs/17, Agent Identity
# Standard, the approved TT prompts). It was NOT built from SBOM_Registry
# v1.27's own file manifest (§4) the way Lesson 11 specifies, because that
# document's content wasn't available when this script was written. If any
# file below is reported MISSING, don't just proceed — check the actual
# path against the SBOM before opening the session on an incomplete package.
# The DISCOVERY SCAN section below is there specifically to surface ground
# truth for files this script can't name with confidence (existing NEXUS/
# VIGIL/SCRIBE internals that Time & Travel will extend, and the exact
# filename of the most recent session handoff).

REPO="$HOME/Developer/sovereign-platform"

exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.41.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign-data/src/shared-types.ts"
  "sovereign-api-client/src/index.ts"
  "sovereign-api-client/src/routing.ts"
  "sovereign-api-client/src/routed-inference.ts"
  "docs/17_TimeAndTravel_Architecture.md"
  "tt/prompts/travel_drafting_system.md"
  "tt/prompts/time_drafting_system.md"
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
# Surfaces ground truth this script can't name with confidence up front.
OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — most recent session handoff candidates\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO" -maxdepth 2 -iname '*handoff*' -newer "$REPO/sovereign-shell/shell-contract.ts" 2>/dev/null)"
OUTPUT+=$'\n'"$(find "$REPO" -maxdepth 2 -iname '*session26*' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — existing module-nexus source (Time & Travel extends this)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/module-nexus" -maxdepth 2 -type f -name '*.ts' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — existing module-vigil source (Time & Travel extends this)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/module-vigil" -maxdepth 2 -type f -name '*.ts' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — existing module-scribe source (Time & Travel extends this)\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/module-scribe" -maxdepth 2 -type f -name '*.ts' 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='DISCOVERY SCAN — existing tt/ directory contents, if any\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(find "$REPO/tt" -maxdepth 3 2>/dev/null)"

OUTPUT+=$'\n\n================================================================\n'
OUTPUT+='GIT STATE\n'
OUTPUT+='================================================================\n'
OUTPUT+="$(cd "$REPO" && git log --oneline -5 2>/dev/null)"
OUTPUT+=$'\n---\n'
OUTPUT+="$(cd "$REPO" && git status --short 2>/dev/null)"

echo "$OUTPUT" | pbcopy

echo ""
echo "Session 27 context package — gathered"
echo "$found of ${#exact_files[@]} exact files found, $missing missing"
echo "Discovery scan included for: session handoff, module-nexus, module-vigil, module-scribe, tt/, git state"
echo "Output copied to clipboard — paste into Claude Code after the opening prompt."
if [ "$missing" -gt 0 ]; then
  echo ""
  echo "!!! $missing file(s) missing — resolve before opening the session, don't proceed blind."
fi
