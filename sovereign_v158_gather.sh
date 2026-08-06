#!/bin/bash
# SOVEREIGN — v1.58 Reconciliation Gather Script
# Run in Terminal 2. Collects raw repo evidence for the sections of DRAFT v1.58
# NOT already covered by the prior reconciliation report (Rules 15-17, cost
# coverage, self-corrections, and which Brief is at repo root are already known —
# this script doesn't re-check those).

cd ~/Developer/sovereign-platform || { echo "ERROR: repo directory not found — check working directory"; exit 1; }

OUT=~/Desktop/sovereign_v158_gather_$(date +%Y%m%d_%H%M%S).md
echo "# SOVEREIGN v1.58 Reconciliation — Gathered $(date)" > "$OUT"

echo -e "\n## Git state" >> "$OUT"
git log -1 >> "$OUT"
git status --short >> "$OUT"

echo -e "\n## v1.58 §2 — Shell contract: current file and hash" >> "$OUT"
SHELL_FILE=$(find . -iname "*shell*contract*" -o -iname "*shell-contract*" 2>/dev/null | grep -v node_modules | grep -vi test | head -5)
echo "Candidate files found:" >> "$OUT"
echo "$SHELL_FILE" >> "$OUT"
for f in $SHELL_FILE; do
  echo "--- $f ---" >> "$OUT"
  shasum -a 256 "$f" >> "$OUT" 2>/dev/null
  head -20 "$f" >> "$OUT" 2>/dev/null
done

echo -e "\n## v1.58 §3 — GD Registry (GD-31 through GD-35)" >> "$OUT"
find . -iname "*GD_Registry*" -o -iname "*GD-Registry*" 2>/dev/null | grep -v node_modules \
  | while read -r f; do echo "Found: $f" >> "$OUT"; grep -n "GD-3[1-5]" "$f" >> "$OUT"; done

echo -e "\n## v1.58 §5 — Staff & program data, real counts" >> "$OUT"
echo "-- staff/employee data files --" >> "$OUT"
find . -iname "*staff*" -o -iname "*employee*" 2>/dev/null | grep -v node_modules | grep -vi test >> "$OUT"
echo "-- program data files --" >> "$OUT"
find . -iname "*program*" 2>/dev/null | grep -v node_modules | grep -vi test | grep -i data >> "$OUT"

echo -e "\n## v1.58 §6 — Reviewer's Workspace parity test coverage" >> "$OUT"
find . -iname "workspace-badge-parity.test.tsx" 2>/dev/null \
  | while read -r f; do echo "Found: $f" >> "$OUT"; grep -n "describe(\|it(\|test(" "$f" >> "$OUT"; done
find . -iname "nexus-flowpath-workspace-convergence.test.tsx" 2>/dev/null \
  | while read -r f; do echo "Found: $f" >> "$OUT"; grep -n "Check 7\|describe(\|it(" "$f" >> "$OUT"; done

echo -e "\n## v1.58 §7 — Rulebook: real rule list in AGENT_REFERENCE.md" >> "$OUT"
find . -iname "AGENT_REFERENCE.md" -exec grep -n "^### Rule\|^\*\*Version" {} \; >> "$OUT"

echo -e "\n## v1.58 §8 — Most recent real test-run evidence" >> "$OUT"
echo "-- recent Handoffs mentioning real pass/fail totals --" >> "$OUT"
find . -iname "*Handoff*" 2>/dev/null | grep -v node_modules | sort | tail -10 >> "$OUT"
find . -iname "*Session9*Handoff*" -o -iname "*Session9*handoff*" 2>/dev/null \
  | while read -r f; do echo "--- $f ---" >> "$OUT"; grep -n "passing\|failing\|exit code" "$f" >> "$OUT"; done

echo -e "\n## Known-file checkpoint (files the prior audit already confirmed exist for real)" >> "$OUT"
KNOWN_FILES=(
  "AGENT_REFERENCE.md"
  "AGENT_REFERENCE_Addendum_20260730.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.57.md"
)
FOUND_COUNT=0
for kf in "${KNOWN_FILES[@]}"; do
  MATCH=$(find . -iname "$kf" 2>/dev/null | grep -v node_modules | head -1)
  if [ -n "$MATCH" ]; then
    echo "FOUND: $kf -> $MATCH" >> "$OUT"
    FOUND_COUNT=$((FOUND_COUNT+1))
  else
    echo "MISSING: $kf" >> "$OUT"
  fi
done
echo -e "\n$FOUND_COUNT of ${#KNOWN_FILES[@]} known files found." >> "$OUT"
echo -e "\n=== CHECKPOINT: $FOUND_COUNT of ${#KNOWN_FILES[@]} known files found. Confirm this before continuing. ==="

echo -e "\n---\nGathered. Saved to: $OUT"

# Copy straight to clipboard so it's ready to paste into Build Agent
if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Copied to clipboard — paste directly into Build Agent now (Cmd+V)."
else
  echo "pbcopy not found — copy manually from the output below, or from: $OUT"
fi

echo "Skim the output below for anything obviously missing before pasting."
echo "======================== BEGIN OUTPUT (for reference) ========================"
cat "$OUT"
echo "========================= END OUTPUT ========================="
