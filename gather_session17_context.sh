#!/usr/bin/env bash
# =============================================================================
# SOVEREIGN Platform — Session 17 Context Gather Script
# =============================================================================

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

# GOVERNANCE DOCUMENTS
append_file "Integration Brief v1.25" "$REPO/SOVEREIGN_Platform_Integration_Brief_v1_25.md"
append_file "Agent Identity Standard" "$REPO/Agent_Identity_Standard.md"
append_file "Agent-to-Agent Briefing" "$REPO/SOVEREIGN_Agent_to_Agent_Briefing.md"
append_file "Agent Reference" "$REPO/AGENT_REFERENCE.md"

# SHELL CONTRACT
append_file "shell-contract.ts (v1.11)" "$REPO/sovereign-shell/shell-contract.ts"

# ARCHITECTURE SPECS
append_file "APEX Architecture Spec (doc 13 — primary build target)" "$REPO/docs/13_APEX_Architecture.md"
append_file "Human Reviewer Experience Standard (doc 14)" "$REPO/docs/14_HumanReviewerStandard.md"
append_file "AgentOS Architecture Spec (doc 11 — APEX upstream)" "$REPO/docs/11_AgentOS_Architecture.md"
append_file "CPMI Architecture Spec (doc 08 — APEX upstream + Gap 4)" "$REPO/docs/08_CPMI_Architecture.md"
append_file "NEXUS Architecture Spec (doc 12 — Gap 1 fix)" "$REPO/docs/12_NEXUS_Architecture.md"
append_file "PPBE Integration Architecture (reference only — §17 anticipation)" "$REPO/SOVEREIGN_PPBE_Integration_Architecture_Draft1.md"

# PRIOR SESSION HANDOFF
append_file "Session 16 Handoff" "$REPO/SOVEREIGN_Session16_Handoff.md"

# GAP FIX TARGETS
append_file "sovereign_logger.py (GD-15 re-sync target)" "$REPO/sovereign-security/sovereign_logger.py"
append_file "NEXUS module entry point (Gap 1 queue fix)" "$REPO/module-nexus/src/index.ts"
append_file "CPMI module entry point (Gap 4 investigation)" "$REPO/module-cpmi/src/index.ts"

# SHARED INFRASTRUCTURE
append_file "sovereign-data shared-types (GD-16 HumanDecisionType sync)" "$REPO/sovereign-data/src/shared-types.ts"
append_file "sovereign-api-client package.json (CommonJS build confirm)" "$REPO/sovereign-api-client/package.json"

# E2E SUITE
append_file "E2E suite index (baseline before gap fixes)" "$REPO/e2e/index.ts"

# REPORT
TOTAL=$((FOUND + MISSING))
echo ""
echo "============================================================"
echo "  SOVEREIGN Platform — Session 17 Context Gather"
echo "============================================================"
echo "  Files found:    $FOUND"
echo "  Files missing:  $MISSING"
echo "  Total expected: $TOTAL"
echo "============================================================"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "  WARNING — MISSING FILES — resolve before pasting into Claude Code:"
  echo ""
  printf "$MISSING_LIST"
  echo ""
  echo "  Do NOT proceed until all files are present."
  echo "============================================================"
  echo ""
  echo "  Clipboard NOT updated."
  echo ""
else
  echo ""
  echo "  18 of 18 files found. 0 missing."
  echo "  Copying to clipboard..."
  echo "============================================================"
  echo ""
  echo "$OUTPUT" | pbcopy
  echo "  Context copied to clipboard."
  echo "  Paste into Claude Code as the first message."
  echo "  Then paste Session_17_Opening_Prompt.txt."
  echo ""
  echo "  Launch sequence:"
  echo "    cd ~/Developer/sovereign-platform"
  echo "    caffeinate -i claude --dangerously-skip-permissions"
  echo "    [Shift+Tab for auto mode]"
  echo "    [Paste clipboard]"
  echo "    [Paste opening prompt]"
  echo "    [Walk away]"
  echo ""
fi
