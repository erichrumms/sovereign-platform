#!/usr/bin/env bash
set -uo pipefail

OUT="/tmp/session35_context.md"
> "$OUT"

echo "SOVEREIGN Session 35 Context Gather (Smoke Test + Cross-Module Fix + TT Verification)" >> "$OUT"
echo "" >> "$OUT"

MISSING=0

add_file() {
  local path="$1"
  local label="$2"
  if [ -f "$path" ]; then
    echo "  OK $path"
    {
      echo "----------------------------------------------------------------"
      echo "FILE: $path"
      echo "PURPOSE: $label"
      echo "----------------------------------------------------------------"
      cat "$path"
      echo ""
    } >> "$OUT"
  else
    echo "  MISSING: $path  ($label)"
    MISSING=$((MISSING+1))
  fi
}

find_and_add() {
  local pattern="$1"
  local label="$2"
  local hit
  hit=$(find . -iname "$pattern" -not -path "./node_modules/*" 2>/dev/null | head -1)
  if [ -n "${hit:-}" ]; then
    add_file "$hit" "$label"
  else
    echo "  NOT FOUND by pattern: $pattern  ($label)"
    MISSING=$((MISSING+1))
  fi
}

echo "Gathering Session 35 context files"
echo ""

echo "-- Standing platform docs --"
add_file "SOVEREIGN_Platform_Integration_Brief_v1.44.md" "Current platform state, critical path"
add_file "AGENT_REFERENCE.md" "Cross-project methodology, Rules 1-7"
add_file "Agent_Identity_Standard.md" "Canonical agent registry"
add_file "shell-contract.ts" "Frozen shell contract, verify SHA-256 matches v1.16"

echo ""
echo "-- Part 1: PPBE prompts, must all read APPROVED --"
add_file "ppbe/prompts/evidence_synthesis_system.md" "Smoke test target 1"
add_file "ppbe/prompts/scenario_analysis_system.md" "Smoke test target 2"
add_file "ppbe/prompts/exhibit_drafting_system.md" "Smoke test target 3"
add_file "ppbe/prompts/coordination_system.md" "Smoke test target 4"

echo ""
echo "-- Part 2: cross-module gap fix (VIGIL -> SCRIBE via taskSurface) --"
find_and_add "*taskSurface*" "GD-19 publish/subscribe mechanism this fix uses"
find_and_add "*ppbe-authorization*" "VIGIL side of the authorization write"
find_and_add "*scribe*queue*" "SCRIBE side, the 'sendable' state this fix updates"

echo ""
echo "-- Part 3: prompt registry reconciliation (TT question already resolved) --"
add_file "tt/prompts/travel_drafting_system.md" "TT drafter prompt, reconstruction claims APPROVED"
add_file "tt/prompts/time_drafting_system.md" "TT time-drafter prompt, reconstruction claims APPROVED"

echo ""
echo "-- Most recent handoff, for what Session 33 + wrap-up actually did --"
find_and_add "*Session33*Handoff*" "Session 33 close artifact"
find_and_add "*wrapup*Handoff*" "Wrap-up pass close artifact"

echo "" >> "$OUT"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "$MISSING file(s) not found by exact path or pattern."
  echo "Some are find-pattern guesses on my part, not confirmed repo paths -- a"
  echo "miss here may just mean the real path differs, not that the file is gone."
  echo "Check MISSING items manually before assuming something is actually absent."
else
  echo "All target files found."
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Context copied to clipboard, $(wc -l < "$OUT") lines."
else
  echo "pbcopy not found, context written to $OUT, copy manually."
fi

echo ""
echo "Next: open Fable 5 in Terminal 1"
