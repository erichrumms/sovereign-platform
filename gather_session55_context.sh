#!/bin/bash
# SOVEREIGN Platform — Context Gather Script — Session 55
# Scope: WG-17 (expiry sweep on Home), WG-15 (SCRIBE session store), WG-16 (optional,
# WorkQueueSurface republish on Workspace decision) — all surfaced by Build Agent at
# Session 54's close (Handoff F5), none blocked on the pending governance decision.

cd "$(dirname "$0")" || exit 1

OUT=/tmp/session55_context.txt
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
add_file "SOVEREIGN_Session54_Handoff.md"

add_file "shell-contract.ts"
add_file "sovereign-shell/shell-contract.ts"

# WG-17 — expiry sweep on Home
add_file "sovereign-shell/src/PlatformHome.tsx"
add_file "sovereign-shell/src/main.tsx"
add_file "module-vigil/src/vigil-approval-session.ts"
add_file "module-vigil/src/approval-contract.ts"
add_file "module-vigil/src/VigilApp.tsx"

# WG-15 — SCRIBE session store
add_file "module-scribe/src/ScribeApp.tsx"
add_file "module-scribe/src/scribe-work-queue-publisher.ts"
add_file "module-scribe/src/scribe-workspace-publisher.ts"
add_file "module-scribe/src/tt-synthetic-review.ts"
add_file "module-workspace/src/WorkspaceApp.tsx"
add_file "sovereign-shell/src/startup-publish.ts"

# WG-16 (optional) — republish WorkQueueSurface after a Workspace decision
add_file "module-vigil/src/vigil-work-queue-publisher.ts"
add_file "module-aria/src/aria-work-queue-publisher.ts"
add_file "sovereign-shell/src/shell.ts"

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
