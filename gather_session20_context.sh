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

append_file "Integration Brief v1.28" "$REPO/SOVEREIGN_Platform_Integration_Brief_v1_28.md"
append_file "Agent Identity Standard" "$REPO/Agent_Identity_Standard.md"
append_file "Agent-to-Agent Briefing" "$REPO/SOVEREIGN_Agent_to_Agent_Briefing.md"
append_file "Agent Reference" "$REPO/AGENT_REFERENCE.md"
append_file "shell-contract.ts (v1.12 — GD-18 target)" "$REPO/sovereign-shell/shell-contract.ts"
append_file "shell-contract.ts root copy" "$REPO/shell-contract.ts"
append_file "FLOWPATH Architecture Spec (doc 15 — primary)" "$REPO/docs/15_FLOWPATH_Architecture.md"
append_file "Human Reviewer Standard (doc 14)" "$REPO/docs/14_HumanReviewerStandard.md"
append_file "APEX Architecture Spec (doc 13 — pattern reference)" "$REPO/docs/13_APEX_Architecture.md"
append_file "AgentOS Architecture Spec (doc 11)" "$REPO/docs/11_AgentOS_Architecture.md"
append_file "PPBE Integration Architecture (reference)" "$REPO/SOVEREIGN_PPBE_Integration_Architecture_Draft1.md"
append_file "Session 19 Handoff" "$REPO/SOVEREIGN_Session19_Handoff.md"
append_file "sovereign-data shared-types (GD-18 sync)" "$REPO/sovereign-data/src/shared-types.ts"
append_file "sovereign_logger.py (GD-18 sync)" "$REPO/sovereign-security/sovereign_logger.py"
append_file "sovereign-shell module-loader" "$REPO/sovereign-shell/src/module-loader/index.ts"
append_file "APEX banners.tsx (approved card pattern)" "$REPO/module-apex/src/banners.tsx"
append_file "APEX ApexApp.tsx (tab structure reference)" "$REPO/module-apex/src/ApexApp.tsx"
append_file "APEX index.ts (module contract reference)" "$REPO/module-apex/src/index.ts"
append_file "E2E pipeline test (baseline + D6 target)" "$REPO/e2e/tests/pipeline.test.tsx"

TOTAL=$((FOUND + MISSING))
echo ""
echo "============================================================"
echo "  SOVEREIGN Platform — Session 20 Context Gather"
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
  echo "  Paste into Claude Code, then paste Session_20_Opening_Prompt.txt."
  echo ""
fi
