#!/bin/bash
# SOVEREIGN Platform — Repository Integrity Check
# Generalizes the method that found AIS-dedupe: duplicate-content detection,
# multi-copy sync verification, provenance review, and a fresh-truth check
# against every asserted count in the governance documents.
#
# Read-only. Nothing here modifies any file.
#
# Produced: July 11, 2026 — Governance Agent

set -e

echo "======================================================"
echo "SOVEREIGN Platform — Repository Integrity Check"
echo "======================================================"
echo ""

echo "--- 1. Full commit history since last verified-good point (Session 26 close) ---"
echo "Looking for any commit not accounted for in current governance documents."
git log dca57a1..HEAD --oneline
echo ""
echo "Full stat detail on each (flag anything unexpected):"
git log dca57a1..HEAD --stat
echo ""

echo "--- 2. Shell-contract dual-copy sync verification (Constraint #11, copy 1 of 5) ---"
echo "Expected hash: 939c2441a1b4a6af16fefae4cbf8269585260646e84d830b4e0529ca8bfa5876"
shasum -a 256 shell-contract.ts sovereign-shell/shell-contract.ts 2>/dev/null
diff shell-contract.ts sovereign-shell/shell-contract.ts > /dev/null 2>&1 \
  && echo "IDENTICAL — copies in sync" \
  || echo "MISMATCH — investigate before proceeding"
echo ""

echo "--- 3. Repo-wide duplicate-header scan (generalizes the AIS-dedupe grep) ---"
echo "Any markdown file with the exact same header text appearing more than once."
FOUND_DUPES=0
for f in $(find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*"); do
  dupes=$(grep "^# \|^## " "$f" 2>/dev/null | sort | uniq -d)
  if [ -n "$dupes" ]; then
    echo ""
    echo "POSSIBLE DUPLICATION in $f:"
    echo "$dupes"
    FOUND_DUPES=1
  fi
done
if [ "$FOUND_DUPES" -eq 0 ]; then
  echo "None found."
fi
echo ""

echo "--- 4. Fresh test count and vulnerability check — verify, don't assume ---"
echo "Every governance document currently asserts 1288 tests, 0 production vulnerabilities,"
echo "carried forward from Session 26. Confirm this is still true:"
if [ -f package.json ]; then
  echo "(Run workspace test command manually — output not auto-captured here"
  echo " since exact per-workspace invocation varies. Compare total against 1288.)"
fi
npm audit --omit=dev 2>/dev/null | tail -5
echo ""

echo "--- 5. Agent count — authoritative table, not a naive grep ---"
echo "Expected: 44. Naive grep is known to overcount (returns 46)."
find . -iname "Agent_Identity_Standard.md" -not -path "*/node_modules/*"
echo "(Verify by reading the file's own summary table, not by grepping line patterns.)"
echo ""

echo "--- 6. Prompt registry vs actual files on disk ---"
echo "Expected: 14 approved prompts (16 once Time & Travel's 2 are approved)."
find . -path "*/prompts/*.md" -not -path "*/node_modules/*" 2>/dev/null
echo "(Cross-check this list against the Prompt Registry's stated paths by hand —"
echo " a mismatch here is the same failure shape as the agent-count issue.)"
echo ""

echo "======================================================"
echo "Integrity check complete. Review sections 1 and 3 first —"
echo "those are the ones most likely to surface something new."
echo "======================================================"
