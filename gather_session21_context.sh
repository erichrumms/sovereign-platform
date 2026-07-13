#!/usr/bin/env bash
REPO="$HOME/Developer/sovereign-platform"
OUTPUT=""
FOUND=0
MISSING=0
MISSING_LIST=""

append_file() {
  local label="$1"
  local path="$2"
  if [ -f "$path" ]; then
    OUTPUT+="
================================================================================
FILE: ${label}
PATH: ${path}
================================================================================
"
    OUTPUT+="$(cat "$path")"
    OUTPUT+="
"
    FOUND=$((FOUND + 1))
  else
    MISSING=$((MISSING + 1))
    MISSING_LIST+="  MISSING: ${label} (${path})\n"
  fi
}

append_file "Integration Brief v1.29" "$REPO/SOVEREIGN_Platform_Integration_Brief_v1_29.md"
append_file "Agent Identity Standard" "$REPO/Agent_Identity_Standard.md"
append_file "Agent-to-Agent Briefing" "$REPO/SOVEREIGN_Agent_to_Agent_Briefing.md"
append_file "Agent Reference" "$REPO/AGENT_REFERENCE.md"
append_file "shell-contract.ts (v1.13)" "$REPO/sovereign-shell/shell-contract.ts"
append_file "shell-contract.ts root" "$REPO/shell-contract.ts"
append_file "FLOWPATH Architecture Spec (doc 15 — primary)" "$REPO/docs/15_FLOWPATH_Architecture.md"
append_file "Human Reviewer Standard (doc 14 — Gap 5/6)" "$REPO/docs/14_HumanReviewerStandard.md"
append_file "CPMI Architecture Spec (doc 08 — Gates tab reference)" "$REPO/docs/08_CPMI_Architecture.md"
append_file "Session 20 Handoff" "$REPO/SOVEREIGN_Session20_Handoff.md"
append_file "FLOWPATH index.ts" "$REPO/module-flowpath/src/index.ts"
append_file "FLOWPATH flowpath-contract.ts" "$REPO/module-flowpath/src/flowpath-contract.ts"
append_file "FLOWPATH banners.tsx (approved card pattern)" "$REPO/module-flowpath/src/banners.tsx"
append_file "FLOWPATH FlowpathApp.tsx" "$REPO/module-flowpath/src/FlowpathApp.tsx"
append_file "FLOWPATH SessionManager.tsx (Screen 1)" "$REPO/module-flowpath/src/SessionManager.tsx"
append_file "FLOWPATH ElicitationDialogue.tsx (Screen 2)" "$REPO/module-flowpath/src/ElicitationDialogue.tsx"
append_file "FLOWPATH synthetic-elicitation.ts" "$REPO/module-flowpath/src/synthetic-elicitation.ts"
append_file "FLOWPATH org_elicitation_system.md (PR-FLOWPATH-001)" "$REPO/module-flowpath/prompts/org_elicitation_system.md"
append_file "FLOWPATH completeness_gate_system.md (PR-FLOWPATH-003)" "$REPO/module-flowpath/prompts/completeness_gate_system.md"
append_file "APEX GateRunnerPanel.tsx (Gates tab pattern)" "$REPO/module-apex/src/GateRunnerPanel.tsx"
append_file "NEXUS index.ts (Item 57)" "$REPO/module-nexus/src/index.ts"
append_file "AgentOS index.ts (Item 57)" "$REPO/module-agentos/src/index.ts"
append_file "sovereign-data shared-types" "$REPO/sovereign-data/src/shared-types.ts"
append_file "E2E pipeline test" "$REPO/e2e/tests/pipeline.test.tsx"

TOTAL=$((FOUND + MISSING))
echo ""
echo "============================================================"
echo "  SOVEREIGN Platform — Session 21 Context Gather"
echo "============================================================"
echo "  Files found:    $FOUND"
echo "  Files missing:  $MISSING"
echo "  Total expected: $TOTAL"
echo "============================================================"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "  WARNING — MISSING FILES:"
  printf "$MISSING_LIST"
  echo "  Do NOT proceed until all files are present."
  echo "  Clipboard NOT updated."
  echo ""
else
  echo ""
  echo "  ${FOUND} of ${TOTAL} files found. 0 missing."
  echo "  Copying to clipboard..."
  echo "$OUTPUT" | pbcopy
  echo "  Context copied to clipboard."
  echo "  Paste into Claude Code, then paste Session_21_Opening_Prompt.txt."
  echo ""
fi
