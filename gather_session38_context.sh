#!/usr/bin/env bash
set -uo pipefail

OUT="/tmp/session38_context.md"
> "$OUT"

echo "SOVEREIGN Session 38 Context Gather (Walkthrough F findings — 5 parts)" >> "$OUT"
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

echo "Gathering Session 38 context files"
echo ""

echo "-- Standing platform docs --"
add_file "AGENT_REFERENCE.md" "Cross-project methodology, Rules 1-11"
add_file "Agent_Identity_Standard.md" "Canonical agent registry"
add_file "shell-contract.ts" "Frozen shell contract, verify hash"
find_and_add "SOVEREIGN_Platform_Integration_Brief*.md" "Current platform state"

echo ""
echo "-- Required reading: the findings themselves --"
add_file "SOVEREIGN_Walkthrough_F_Findings_Report.md" "Authoritative source for every finding this session addresses"

echo ""
echo "-- Part 1: SCRIBE click-through --"
add_file "module-scribe/src/PPBEDashboard.tsx" "May be unrelated — verify path; the actual TT Review queue component needed"
find_and_add "*TTReview*" "SCRIBE Time & Travel Review queue component"
find_and_add "*tt-synthetic-review*" "Seed data behind the queue"

echo ""
echo "-- Part 2: PPBE agent source files (WF-10) --"
add_file "module-apex/src/ppbe-evidence-synthesizer.ts" "Agent 1 of 4, currently unwired"
add_file "module-apex/src/ppbe-scenario-analyst.ts" "Agent 2 of 4, currently unwired"
add_file "module-scribe/src/ppbe-exhibit-engine.ts" "Agent 3 of 4, currently unwired"
add_file "module-nexus/src/ppbe-coordination-assistant.ts" "Agent 4 of 4, currently unwired"
add_file "module-apex/src/PPBEDashboard.tsx" "Likely mounting point for new triggers"
add_file "module-apex/src/ApexApp.tsx" "Composition root, likely where triggers get wired"

echo ""
echo "-- Part 3: Obligation authorization (WF-9) --"
add_file "module-vigil/src/ppbe-authorization.ts" "recordObligationAuthorization(), currently unwired"
find_and_add "*ApprovalQueue*" "VIGIL's existing approval queue component, the pattern to extend"

echo ""
echo "-- Part 4: Supervision Efficiency (WF-11) --"
find_and_add "14_HumanReviewerStandard.md" "Base standard — Gap 5/6 definitions"
find_and_add "*Addendum_SupervisionEfficiency*" "The binding standard itself, all three sub-parts"
find_and_add "*ClearDashboard*" "ARIA's governance-calendar table — the reference pattern to match"

echo ""
echo "-- Part 5: Confirmed bug fixes --"
find_and_add "*PlatformHome*" "WF-1, Invalid Date bug"
add_file "sovereign-data/src/synthetic/ppbe-seed.ts" "WF-5 — confirms program attribution already exists"
add_file "module-apex/src/apex-data-adapter.ts" "WF-4 — Portfolio Dashboard / Program Detail routing"

echo "" >> "$OUT"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "$MISSING file(s) not found by exact path or pattern."
  echo "Several are find-pattern guesses, not confirmed repo paths -- a miss"
  echo "here may just mean the real path differs. Check manually before"
  echo "assuming something is actually absent."
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
echo "Next: open the Build Agent in Terminal 1"
