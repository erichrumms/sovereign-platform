#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 54
# Scope: Walkthrough G Build Session 1 (WG-1, WG-2, WG-3, WG-4, WG-5, WG-12, WG-13)

set -uo pipefail
cd "$(dirname "$0")" || exit 1

OUT=/tmp/session54_context.txt
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

add_file "SOVEREIGN_Platform_Integration_Brief_v1.48.md"
add_file "SOVEREIGN_Agent_to_Agent_Briefing_20260721.md"
add_file "AGENT_REFERENCE.md"
add_file "Agent_Identity_Standard.md"
add_file "docs/SOVEREIGN_Walkthrough_G_Findings_Report_20260721.md"
add_file "docs/26_Execution_Monitoring_Target_State_and_Analyst_Workday.md"
add_file "docs/28_Logger_Write_Only_Provenance_Gap.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

add_file "sovereign-shell/src/PlatformHome.tsx"
add_file "sovereign-shell/src/main.tsx"
add_file "module-apex/src/ApexApp.tsx"
add_file "module-vigil/src/VigilApp.tsx"
add_file "module-vigil/src/vigil-work-queue-publisher.ts"
add_file "module-vigil/src/vigil-workspace-publisher.ts"
add_file "module-aria/src/AriaApp.tsx"
add_file "module-nexus/src/nexus-work-queue-publisher.ts"
add_file "module-scribe/src/ScribeApp.tsx"
add_file "module-scribe/src/scribe-work-queue-publisher.ts"
add_file "module-scribe/src/scribe-workspace-publisher.ts"
add_file "module-workspace/src/WorkspaceApp.tsx"
add_file "module-workspace/src/useReviewerWorkspaceItems.ts"

add_file "sovereign-shell/src/navigation/ModuleNav.tsx"
add_file "sovereign-shell/src/navigation/ShellNavChrome.tsx"

add_file "module-apex/src/PPBEDashboard.tsx"

add_file "module-vigil/src/useApprovalQueue.ts"
add_file "module-vigil/src/approval-contract.ts"

add_file "module-apex/src/ppbe-data-adapter.ts"
add_file "sovereign-data/src/synthetic/ppbe-seed.ts"

add_file "module-vigil/src/approval-port.ts"

echo ""
echo "$FOUND files found, $MISSING missing."
if [ "$MISSING" -gt 0 ]; then
  echo "MISSING FILES — do not proceed until this is resolved:"
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
