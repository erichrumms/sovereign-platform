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

append_file "Integration Brief v1.26" "$REPO/SOVEREIGN_Platform_Integration_Brief_v1_26.md"
append_file "Agent Identity Standard" "$REPO/Agent_Identity_Standard.md"
append_file "Agent-to-Agent Briefing" "$REPO/SOVEREIGN_Agent_to_Agent_Briefing.md"
append_file "Agent Reference" "$REPO/AGENT_REFERENCE.md"
append_file "shell-contract.ts (v1.12)" "$REPO/sovereign-shell/shell-contract.ts"
append_file "APEX Architecture Spec (doc 13)" "$REPO/docs/13_APEX_Architecture.md"
append_file "Human Reviewer Standard (doc 14)" "$REPO/docs/14_HumanReviewerStandard.md"
append_file "CPMI Architecture Spec (doc 08)" "$REPO/docs/08_CPMI_Architecture.md"
append_file "AgentOS Architecture Spec (doc 11)" "$REPO/docs/11_AgentOS_Architecture.md"
append_file "NEXUS Architecture Spec (doc 12)" "$REPO/docs/12_NEXUS_Architecture.md"
append_file "Session 17 Handoff" "$REPO/SOVEREIGN_Session17_Handoff.md"
append_file "APEX index.ts" "$REPO/module-apex/src/index.ts"
append_file "APEX benchmark-scenarios.ts" "$REPO/module-apex/src/benchmark-scenarios.ts"
append_file "APEX ApexApp.tsx" "$REPO/module-apex/src/ApexApp.tsx"
append_file "APEX banners.tsx" "$REPO/module-apex/src/banners.tsx"
append_file "APEX apex-contract.ts" "$REPO/module-apex/src/apex-contract.ts"
append_file "CPMI index.ts (Gates tab pattern)" "$REPO/module-cpmi/src/index.ts"
append_file "sovereign_logger.py (D1 target)" "$REPO/sovereign-security/sovereign_logger.py"
append_file "NEXUS index.ts (D3 target)" "$REPO/module-nexus/src/index.ts"
append_file "AgentOS index.ts (D3 target)" "$REPO/module-agentos/src/index.ts"
append_file "E2E pipeline test (D4 target)" "$REPO/e2e/tests/pipeline.test.tsx"
append_file "sovereign-data shared-types" "$REPO/sovereign-data/src/shared-types.ts"

TOTAL=$((FOUND + MISSING))
echo ""
echo "============================================================"
echo "  SOVEREIGN Platform — Session 18 Context Gather"
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
  echo "  Paste into Claude Code, then paste Session_18_Opening_Prompt.txt."
  echo ""
fi
