#!/usr/bin/env bash
set -uo pipefail

CURRENT_MANIFEST=(
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.42.md"
)

echo "SOVEREIGN Preflight Check"
echo "Verifying claimed-delivered files are actually committed"
echo ""

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Not inside a git repo. cd into the repo root first."
  exit 1
fi

FAIL=0

for f in "${CURRENT_MANIFEST[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  MISSING FROM DISK: $f"
    FAIL=1
    continue
  fi
  if git ls-files --error-unmatch "$f" > /dev/null 2>&1; then
    echo "  OK tracked and on disk: $f"
  else
    echo "  ON DISK BUT NOT COMMITTED: $f"
    FAIL=1
  fi
done

echo ""
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNPUSHED" != "0" ]; then
  echo "  $UNPUSHED local commit(s) not yet pushed to origin/main:"
  git log origin/main..HEAD --oneline 2>/dev/null
  FAIL=1
fi

echo ""
if [ "$FAIL" -eq 1 ]; then
  echo "PREFLIGHT FAILED. Do not open Fable 5 yet."
  exit 1
else
  echo "PREFLIGHT CLEAN. Safe to run the gather script now."
  exit 0
fi
