#!/bin/bash
# =============================================================
# SOVEREIGN Platform — Session 10 Context Gather Script
# Run in a second Terminal window before opening Claude Code.
# Prints all context files with clear headers, then copies
# the full output to your clipboard.
#
# Monorepo path: ~/Developer/sovereign-platform/
# Session 10 focus: VIGIL Agent Approval flow + vigil-approval-agent
# =============================================================

REPO="$HOME/Developer/sovereign-platform"

# ── Exact-path files (known locations) ───────────────────────
exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "Agent_Identity_Standard.md"
  "sovereign-shell/shell-contract.ts"
  "module-vigil/src/index.ts"
  "module-vigil/src/useAlertQueue.ts"
  "module-vigil/src/useAlertResponse.ts"
  "module-vigil/src/vigil-types.ts"
  "module-vigil/src/config.ts"
  "module-vigil/src/vigil-endpoint.ts"
  "module-vigil/src/security-query.ts"
  "docs/04_VIGIL_Operator_Dashboard.md"
  "docs/05_VIGIL_Agent_Approval.md"
)

# ── Doc files (search the repo if not found at exact path) ───
doc_names=(
  "sovereign_data_CompanionSuite_Specification.md"
)

OUTPUT=""

header() {
  printf '\n================================================================\n'
  printf 'FILE: %s\n' "$1"
  printf '================================================================\n'
}

missing=0
found=0

# ── Process exact-path files ─────────────────────────────────
for rel in "${exact_files[@]}"; do
  abs="$REPO/$rel"
  if [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING (exact path): $rel"$'\n'
    missing=$((missing + 1))
  fi
done

# ── Process doc files (search whole repo) ────────────────────
for name in "${doc_names[@]}"; do
  # sovereign_data_CompanionSuite_Specification.md lives at monorepo root
  if [ -f "$REPO/$name" ]; then
    rel="$name"
    abs="$REPO/$name"
  elif [ -f "$REPO/docs/$name" ]; then
    rel="docs/$name"
    abs="$REPO/docs/$name"
  else
    abs=$(find "$REPO" -name "$name" 2>/dev/null | head -1)
    rel="${abs#$REPO/}"
  fi

  if [ -n "$abs" ] && [ -f "$abs" ]; then
    OUTPUT+="$(header "$rel"; cat "$abs"; echo)"
    found=$((found + 1))
  else
    OUTPUT+=$'\n'"!!! MISSING (searched whole repo): $name"$'\n'
    missing=$((missing + 1))
  fi
done

# ── Summary ──────────────────────────────────────────────────
total=$((found + missing))
SUMMARY=$'\n'"================================================================"
SUMMARY+=$'\n'"SESSION 10 CONTEXT PACKAGE — $(date)"
SUMMARY+=$'\n'"$found of $total files found. $missing missing."
SUMMARY+=$'\n'"================================================================"

FULL_OUTPUT="$SUMMARY"$'\n'"$OUTPUT"$'\n'"$SUMMARY"

echo "$FULL_OUTPUT"

# ── Copy to clipboard ─────────────────────────────────────────
echo "$FULL_OUTPUT" | pbcopy
echo ""
echo ">>> Output copied to clipboard. Paste into Claude Code."

if [ "$missing" -gt 0 ]; then
  echo ">>> WARNING: $missing file(s) were not found. Review !!! MISSING lines above."
fi
