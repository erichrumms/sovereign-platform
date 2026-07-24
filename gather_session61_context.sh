#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 61
# Scope: docs/30 §2 — the coordinated session-state-resurrection + navigation fix.
# Order matters: D1 (live subscription) must land before D6/D7 (navigation) are safe.

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session61_context.txt
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
add_file "docs/30_Session60_Assessment_Action_Plan.md"
add_file "SOVEREIGN_Platform_EndToEnd_Assessment_20260723.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# D1/D2 — VIGIL: live subscription root fix + Alert Queue
add_file "module-vigil/src/VigilApp.tsx"
add_file "module-vigil/src/vigil-approval-session.ts"
add_file "module-vigil/src/useAlertQueue.ts"
add_file "module-vigil/src/AlertQueue.tsx"

# Reference pattern for adding subscribe/notify — TaskSurface / AriaCertificationSurface
add_file "sovereign-shell/src/shell.ts"

# D3 — ARIA Gates 3/4
add_file "module-aria/src/AriaVrsGates.tsx"
add_file "module-aria/src/AriaApp.tsx"

# D4 — NEXUS TT queues
add_file "module-nexus/src/useTTIntake.ts"
add_file "module-nexus/src/NexusApp.tsx"

# D5 — FLOWPATH approvals
add_file "module-flowpath/src/FlowpathApp.tsx"
add_file "module-flowpath/src/SessionManager.tsx"

# D6/D7 — navigation
add_file "sovereign-shell/src/main.tsx"
add_file "sovereign-shell/src/navigation/ShellNavChrome.tsx"
add_file "sovereign-shell/src/navigation/ModuleNav.tsx"

# Existing test references for the proven pattern
add_file "module-vigil/tests/vigil-approval-session.test.ts"
add_file "module-scribe/src/scribe-sent-session.ts"

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
