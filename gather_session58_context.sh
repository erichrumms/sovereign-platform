#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 58
# Scope: e2e tsc fix (folded in per Project Principal request) + GD-28 (shell-contract) +
# WG-14's Activity/Decision History view, built as a new tab in the Reviewer's Workspace.

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session58_context.txt
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
add_file "docs/28_Logger_Write_Only_Provenance_Gap.md"
add_file "docs/29_Governance_Decisions_WG11_WG7_WG14.md"
add_file "SOVEREIGN_Session57_Verification_Addendum.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# D1 — the e2e tsc fix
add_file "e2e/tests/home-dashboard-startup.test.tsx"

# D2/D3 — GD-28 + the new Activity View tab
add_file "sovereign-shell/src/shell.ts"
add_file "module-workspace/src/WorkspaceApp.tsx"
add_file "module-workspace/src/useReviewerWorkspaceItems.ts"
add_file "module-vigil/src/vigil-approval-session.ts"

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
