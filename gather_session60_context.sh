#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 60
# Scope: Comprehensive end-to-end verification, validation, and R/E/S assessment
# across every module and tab/screen, plus Session 59's D3 test-coverage gap.
# This gathers ORIENTATION material only — Build Agent must explore each module's
# full component tree itself as part of the audit; this is not a complete file dump.

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session60_context.txt
> "$OUT"

FOUND=0
MISSING=0
MISSING_LIST=()

add_file() {
  local path="$1"
  if [ -f "$path" ]; then
    echo "" >> "$OUT"
    echo "═══════════════════════════════════════════════════════════════" >> "$OUT"
    echo "FILE: $path" >> "$OUT"
    echo "═══════════════════════════════════════════════════════════════" >> "$OUT"
    cat "$path" >> "$OUT"
    FOUND=$((FOUND + 1))
  else
    MISSING=$((MISSING + 1))
    MISSING_LIST+=("$path")
  fi
}

# ── Governance / reference ──
add_file "SOVEREIGN_Platform_Integration_Brief_v1.48.md"
add_file "SOVEREIGN_Agent_to_Agent_Briefing_20260721.md"
add_file "AGENT_REFERENCE.md"
add_file "Agent_Identity_Standard.md"
add_file "SOVEREIGN_Role_Access_Matrix_20260721.md"
add_file "docs/SOVEREIGN_Walkthrough_G_Findings_Report_20260721.md"
add_file "docs/22_Informed_Decision_Making.md"
add_file "docs/26_Execution_Monitoring_Target_State_and_Analyst_Workday.md"
add_file "docs/29_Governance_Decisions_WG11_WG7_WG14.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# ── Shell / Home / navigation ──
add_file "sovereign-shell/src/main.tsx"
add_file "sovereign-shell/src/PlatformHome.tsx"
add_file "sovereign-shell/src/navigation/ModuleNav.tsx"
add_file "sovereign-shell/src/navigation/ShellNavChrome.tsx"

# ── One entry point per module — starting points, not the full tree ──
add_file "module-counsel/src/CounselApp.tsx"
add_file "module-scribe/src/ScribeApp.tsx"
add_file "module-lens/src/LensApp.tsx"
add_file "module-vigil/src/VigilApp.tsx"
add_file "module-cpmi/src/CpmiApp.tsx"
add_file "module-agentos/src/AgentOSApp.tsx"
add_file "module-nexus/src/NexusApp.tsx"
add_file "module-apex/src/ApexApp.tsx"
add_file "module-flowpath/src/FlowpathApp.tsx"
add_file "module-aria/src/AriaApp.tsx"
add_file "module-workspace/src/WorkspaceApp.tsx"

# ── Session 59's D3 gap — reason-code chip test coverage ──
add_file "module-vigil/src/ApprovalDecisionPanel.tsx"
add_file "module-vigil/src/ObligationDecisionPanel.tsx"
add_file "module-aria/src/ClearCertificationQueue.tsx"
add_file "module-vigil/tests/ApprovalDecisionPanel.test.tsx"
add_file "module-aria/tests/ClearCertificationQueue.test.tsx"

echo ""
echo "$FOUND files found, $MISSING missing."
if [ "$MISSING" -gt 0 ]; then
  echo "MISSING FILES (some are expected — e.g. if a module's test file uses a"
  echo "different name, that's fine; Build Agent will locate the real one during"
  echo "its own audit):"
  for f in "${MISSING_LIST[@]}"; do
    echo "  - $f"
  done
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Copied to clipboard."
else
  echo "pbcopy not found — content written to $OUT, copy manually."
fi
