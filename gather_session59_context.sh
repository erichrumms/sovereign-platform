#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 59
# Scope: D1 memory cleanup (not git-tracked) + D2 WG-6 (pad synthetic fiscal periods,
# demo-cosmetic) + D3 decision-note reason codes (VIGIL + ARIA, additive to free text).

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session59_context.txt
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
add_file "docs/29_Governance_Decisions_WG11_WG7_WG14.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# D2 — WG-6: pad synthetic fiscal periods
add_file "sovereign-data/src/synthetic/ppbe-seed.ts"
add_file "module-apex/src/ppbe-data-adapter.ts"
add_file "module-apex/src/PPBEDashboard.tsx"
add_file "module-apex/tests/PPBEDashboard.test.tsx"

# D3 — decision-note reason codes, VIGIL + ARIA
add_file "module-vigil/src/ApprovalDecisionPanel.tsx"
add_file "module-vigil/src/ObligationDecisionPanel.tsx"
add_file "module-vigil/src/approval-contract.ts"
add_file "module-aria/src/ClearCertificationQueue.tsx"

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
