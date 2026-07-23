#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 56
# Scope: D1 — real test coverage for Session 55's WG-17/WG-15/WG-16 deliverables
#        D2 — resolve the npm audit --omit=dev scope question definitively
# Both required. No shell-contract change, no governance decision.

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session56_context.txt
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
add_file "Session55_Handoff.md"
add_file "Session55_SBOM_Update.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# D1 — source files needing test coverage
add_file "sovereign-shell/src/PlatformHome.tsx"
add_file "module-scribe/src/scribe-sent-session.ts"
add_file "module-scribe/src/ScribeApp.tsx"
add_file "sovereign-shell/src/startup-publish.ts"
add_file "module-workspace/src/WorkspaceApp.tsx"
add_file "module-workspace/tests/test-helpers.tsx"
add_file "module-vigil/src/vigil-approval-session.ts"
add_file "module-vigil/src/approval-contract.ts"

# D1 — existing tests to follow as the reference pattern (Constraint #2)
add_file "module-vigil/tests/vigil-approval-session.test.ts"
add_file "e2e/tests/startup-publish-convergence.test.ts"
add_file "e2e/tests/home-dashboard-startup.test.tsx"

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
