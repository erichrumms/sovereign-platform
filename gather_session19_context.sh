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

append_file "Integration Brief v1.27" "$REPO/SOVEREIGN_Platform_Integration_Brief_v1_27.md"
append_file "Agent Identity Standard" "$REPO/Agent_Identity_Standard.md"
append_file "Agent-to-Agent Briefing" "$REPO/SOVEREIGN_Agent_to_Agent_Briefing.md"
append_file "Agent Reference" "$REPO/AGENT_REFERENCE.md"
append_file "shell-contract.ts (v1.12)" "$REPO/sovereign-shell/shell-contract.ts"
append_file "APEX Architecture Spec (doc 13)" "$REPO/docs/13_APEX_Architecture.md"
append_file "Human Reviewer Standard (doc 14)" "$REPO/docs/14_HumanReviewerStandard.md"
append_file "FLOWPATH Architecture Spec (doc 15)" "$REPO/docs/15_FLOWPATH_Architecture.md"
append_file "Session 18 Handoff" "$REPO/SOVEREIGN_Session18_Handoff.md"
append_file "APEX GateRunnerPanel (D1 target)" "$REPO/module-apex/src/GateRunnerPanel.tsx"
append_file "APEX ApexApp" "$REPO/module-apex/src/ApexApp.tsx"
append_file "APEX banners" "$REPO/module-apex/src/banners.tsx"
append_file "APEX PortfolioDashboard (D2 target)" "$REPO/module-apex/src/PortfolioDashboard.tsx"
append_file "APEX ProgramDetailView (D2 target)" "$REPO/module-apex/src/ProgramDetailView.tsx"
append_file "APEX ReportGenerationPanel (D2/D4 target)" "$REPO/module-apex/src/ReportGenerationPanel.tsx"
append_file "APEX ProvenancePanel (D3 target)" "$REPO/module-apex/src/ProvenancePanel.tsx"
append_file "APEX apex-contract (D3 type)" "$REPO/module-apex/src/apex-contract.ts"
append_file "APEX apex-analysis (D3 source)" "$REPO/module-apex/src/apex-analysis.ts"
append_file "APEX synthetic-world-model (D3 data)" "$REPO/module-apex/src/synthetic-world-model.ts"
append_file "APEX index.ts" "$REPO/module-apex/src/index.ts"
append_file "APEX ProvenancePanel test" "$REPO/module-apex/tests/ProvenancePanel.test.tsx"
append_file "APEX GateRunnerPanel test" "$REPO/module-apex/tests/GateRunnerPanel.test.tsx"
append_file "APEX ProgramDetailView test" "$REPO/module-apex/tests/ProgramDetailView.test.tsx"
append_file "shell-contract.ts root" "$REPO/shell-contract.ts"
append_file "sovereign-data shared-types" "$REPO/sovereign-data/src/shared-types.ts"
append_file "E2E pipeline test" "$REPO/e2e/tests/pipeline.test.tsx"

TOTAL=$((FOUND + MISSING))
echo ""
echo "============================================================"
echo "  SOVEREIGN Platform — Session 19 Context Gather"
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
  echo "  Paste into Claude Code, then paste Session_19_Opening_Prompt.txt."
  echo ""
fi
