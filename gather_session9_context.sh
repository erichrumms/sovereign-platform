#!/bin/bash
# =============================================================
# SOVEREIGN Platform — Session 9 Context Gather Script
# Run in a second Terminal window before opening Claude Code.
# Prints all context files with clear headers, then copies
# the full output to your clipboard.
#
# Monorepo path: ~/Developer/sovereign-platform/
# Fix (vs. Session 8 script): sovereign_data_CompanionSuite_Specification.md
# lives at MONOREPO ROOT, not docs/ — path corrected below.
# =============================================================

REPO="$HOME/Developer/sovereign-platform"

# ── Exact-path files (known locations) ───────────────────────
exact_files=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "sovereign-shell/shell-contract.ts"
  "sovereign_data_CompanionSuite_Specification.md"
  "module-vigil/src/index.ts"
  "module-vigil/src/useAlertQueue.ts"
  "module-vigil/src/useAlertResponse.ts"
  "module-vigil/src/vigil-types.ts"
  "docs/04_VIGIL_Operator_Dashboard.md"
  "docs/vigil_alert_response.md"
  "docs/vigil_agent_approvals.md"
)

# ── Doc files (search the repo if not found at exact path) ───
doc_names=(
  "02_SCRIBE_Drafting_Workspace.md"
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
  if [ -f "$REPO/docs/$name" ]; then
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
SUMMARY+=$'\n'"SESSION 9 CONTEXT PACKAGE — $(date)"
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
