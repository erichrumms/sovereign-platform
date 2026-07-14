#!/usr/bin/env bash
set -uo pipefail
REPO_ROOT="$HOME/Developer/sovereign-platform"
cd "$REPO_ROOT" || { echo "FAIL: could not cd into $REPO_ROOT"; exit 1; }
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Not inside a git repo. cd into the repo root first."
  exit 1
fi
FAIL=0
echo "SOVEREIGN Platform — Preflight Check"
echo "Repo: $REPO_ROOT"
echo "Run at: $(date)"
echo ""
echo "[1] Git working tree status"
if [ -n "$(git status --porcelain)" ]; then
  echo "  FAIL: uncommitted changes present."
  git status --short
  FAIL=1
else
  echo "  OK: working tree clean."
fi
echo ""
echo "[2] Current governance docs — tracked and committed"
CURRENT_MANIFEST=(
  "SOVEREIGN_Platform_Integration_Brief_v1.44.md"
  "SOVEREIGN_Agent_to_Agent_Briefing.md"
)
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
echo "[3] Unpushed commits"
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNPUSHED" != "0" ]; then
  echo "  $UNPUSHED local commit(s) not yet pushed to origin/main:"
  git log origin/main..HEAD --oneline 2>/dev/null
  FAIL=1
else
  echo "  OK: local main matches origin/main."
fi
echo ""
echo "[4] HEAD commit"
git log -1 --format="  %h  %ad  %s" --date=short
echo ""
echo "[5] Shell contract v1.16 hash"
EXPECTED_HASH="521a62daa77a1986a6e23fc2ee29c5bedf082933d7c42b4cd25eb0e7b4fd5fb7"
SHELL_CONTRACT_PATH="shell-contract.ts"
if [ -f "$SHELL_CONTRACT_PATH" ]; then
  ACTUAL_HASH=$(shasum -a 256 "$SHELL_CONTRACT_PATH" | awk '{print $1}')
  if [ "$ACTUAL_HASH" = "$EXPECTED_HASH" ]; then
    echo "  OK: $SHELL_CONTRACT_PATH matches expected v1.16 hash."
  else
    echo "  FAIL: $SHELL_CONTRACT_PATH hash mismatch."
    echo "    expected: $EXPECTED_HASH"
    echo "    actual:   $ACTUAL_HASH"
    FAIL=1
  fi
else
  echo "  FAIL: $SHELL_CONTRACT_PATH not found at expected path."
  FAIL=1
fi
echo ""
echo "[6] PPBE prompt approval status"
PPBE_PROMPTS=(
  "ppbe/prompts/evidence_synthesis_system.md"
  "ppbe/prompts/scenario_analysis_system.md"
  "ppbe/prompts/exhibit_drafting_system.md"
  "ppbe/prompts/coordination_system.md"
)
for p in "${PPBE_PROMPTS[@]}"; do
  if [ -f "$p" ]; then
    STATUS_LINE=$(grep "STATUS:" "$p" | head -1)
    echo "  $p"
    echo "    $STATUS_LINE"
    if ! echo "$STATUS_LINE" | grep -q "APPROVED"; then
      echo "    FAIL: expected APPROVED."
      FAIL=1
    fi
  else
    echo "  FAIL: $p not found at expected path."
    FAIL=1
  fi
done
echo ""
echo "[7] Time & Travel prompt approval status"
TT_PROMPTS=(
  "tt/prompts/travel_drafting_system.md"
  "tt/prompts/time_drafting_system.md"
)
for p in "${TT_PROMPTS[@]}"; do
  if [ -f "$p" ]; then
    STATUS_LINE=$(grep "STATUS:" "$p" | head -1)
    echo "  $p"
    echo "    $STATUS_LINE"
    if ! echo "$STATUS_LINE" | grep -q "APPROVED"; then
      echo "    FAIL: expected APPROVED."
      FAIL=1
    fi
  else
    echo "  FAIL: $p not found at expected path."
    FAIL=1
  fi
done
echo ""
echo "[8] Agent and prompt counts (informational — do not treat as pass/fail)"
AGENT_FILE="Agent_Identity_Standard.md"
if [ -f "$AGENT_FILE" ]; then
  COUNT=$(grep -oE '`(flowpath\.[a-z-]+|cpmi\.[a-z-]+|agentos\.[a-z-]+|nexus\.[a-z-]+|apex\.[a-z-]+|aria\.[a-z-]+|counsel-[a-z-]+|scribe-[a-z-]+|lens-[a-z-]+|vigil-[a-z-]+|ppbe-[a-z-]+|tt\.[a-z-]+)`' "$AGENT_FILE" | tr -d '`' | sort -u | wc -l | tr -d ' ')
  echo "  Counted $COUNT UNIQUE agent_id values (deduped across all tables) in $AGENT_FILE."
  echo "  Expected: 44 (36 master + 8 TT) — confirmed via primary source, July 13, 2026."
else
  echo "  NOTE: $AGENT_FILE not found at repo root — adjust this script's path if it lives elsewhere."
fi
PROMPT_STATUS_COUNT=$(grep -rl "STATUS" --include="*.md" tt/prompts/ ppbe/prompts/ module-*/prompts/ 2>/dev/null | wc -l | tr -d ' ')
echo "  Found $PROMPT_STATUS_COUNT prompt files with a STATUS header across tt/, ppbe/, module-*/prompts/."
echo "  Known open question: session history implies 20 approved; current docs claim 19"
echo "  approved + 1 pending (PR-SCRIBE-004). Unreconciled as of this script's writing —"
echo "  see Session 35 Part 3."
echo ""
echo "======================================"
if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: CLEAN"
else
  echo "RESULT: FAILED — resolve the items above before opening Claude Code."
fi
echo "======================================"
exit $FAIL
