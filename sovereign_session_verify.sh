#!/usr/bin/env bash
# ============================================================
# SOVEREIGN Platform — Session-Open Verification Script
# Authored by: Governance Agent · July 17, 2026 (v2 — corrected after first real run)
# Updated: Session 43 · July 19, 2026 (v3 — HEAD + hash advanced to current state)
# Updated: Session 51 · July 20, 2026 (v4 — HEAD + hash advanced; v1.20 / GD-25)
# Run in Terminal 2 (Terminal 1 is reserved for the Build Agent)
# ============================================================
#
# Purpose: before trusting System Prompt / New Conversation Handoff
# claims at session open, check them against the actual repo — real
# exit codes (Rule 7), real content not just a successful command
# (Rule 10), counts taken directly rather than carried forward from a
# document (Lesson 12).
#
# EXPECTED_HEAD and EXPECTED_CONTRACT_HASH must be updated each session.
# Both will produce false WARNs the moment new commits land — that's
# expected and not a bug. Update them at session close when you commit.
# Shell contract version as of v4: v1.20 (GD-25, Session 50/51).
#
# Run:
#   chmod +x sovereign_session_verify.sh
#   ./sovereign_session_verify.sh [path-to-repo-root]
# ============================================================

EXPECTED_HEAD="PLACEHOLDER_UPDATED_AT_CLOSE"             # update each session — see note above
EXPECTED_CONTRACT_HASH="22ee233525ac2c636153cb604ec6a7c1822889a02f9d38bfbc0dda3d921f63d3"
KNOWN_CONTRACT_PATHS="./sovereign-shell/shell-contract.ts ./shell-contract.ts"
PY_TEST_DIR="./sovereign-security"                        # confirmed real location
DEFAULT_REPO_ROOT="$HOME/Developer/sovereign-platform"

set -uo pipefail   # deliberately NOT -e: every check should run and report,
                    # not halt silently on the first failure

REPO_ROOT="${1:-$DEFAULT_REPO_ROOT}"
if [ ! -d "$REPO_ROOT" ]; then
  echo "FAIL: $REPO_ROOT does not exist."
  echo "  If the monorepo lives somewhere else, run:"
  echo "    ./sovereign_session_verify.sh /actual/path/to/sovereign-platform"
  exit 1
fi
cd "$REPO_ROOT" || { echo "FAIL: cannot cd into $REPO_ROOT"; exit 1; }
echo "Running against: $(pwd)"
echo

PASS=0; WARN=0; FAIL=0
pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

echo "============================================================"
echo "1. GIT STATE"
echo "============================================================"
if [ ! -d .git ]; then
  fail "Not a git repository at $(pwd) — pass the repo root as \$1"
else
  ACTUAL_HEAD=$(git rev-parse --short HEAD)
  if [ "$ACTUAL_HEAD" = "$EXPECTED_HEAD" ]; then
    pass "HEAD is $ACTUAL_HEAD — matches expected"
  else
    warn "HEAD is $ACTUAL_HEAD — expected $EXPECTED_HEAD (may just mean new commits landed since this script was last updated; check what's new, don't assume it's wrong)"
  fi

  DIRTY=$(git status --porcelain | grep -v "sovereign_session_verify.sh")
  if [ -z "$DIRTY" ]; then
    pass "Working tree clean (ignoring this script itself)"
  else
    warn "Working tree has uncommitted changes:"; echo "$DIRTY" | sed 's/^/    /'
  fi

  echo; echo "-- Commit 12cb626 (prompt-placeholder fix) --"
  if git cat-file -e 12cb626^{commit} 2>/dev/null; then
    pass "12cb626 exists"
  else
    fail "12cb626 NOT found"
  fi

  echo; echo "-- Commit 8080347 (Session 38 close) --"
  if git cat-file -e 8080347^{commit} 2>/dev/null; then
    pass "8080347 exists"
  else
    fail "8080347 NOT found"
  fi
fi

echo
echo "============================================================"
echo "2. SHELL CONTRACT HASH"
echo "============================================================"
FOUND_ANY=0
HASHES_SEEN=""
for f in $KNOWN_CONTRACT_PATHS; do
  if [ -f "$f" ]; then
    FOUND_ANY=1
    H=$(sha256sum "$f" | awk '{print $1}')
    HASHES_SEEN="$HASHES_SEEN|$f:$H"
    if [ "$H" = "$EXPECTED_CONTRACT_HASH" ]; then
      pass "$f matches documented v1.20 hash"
    else
      warn "$f hash is $H — does NOT match documented v1.20 hash"
    fi
  fi
done
if [ "$FOUND_ANY" -eq 0 ]; then
  warn "Neither known contract path exists — broader search:"
  find . -iname "*shell-contract*.ts" -not -path "*/node_modules/*" 2>/dev/null | sed 's/^/    /'
else
  COPY_COUNT=$(echo "$HASHES_SEEN" | tr '|' '\n' | grep -c ':')
  UNIQUE_HASHES=$(echo "$HASHES_SEEN" | tr '|' '\n' | grep ':' | cut -d: -f2 | sort -u | wc -l | tr -d ' ')
  if [ "$COPY_COUNT" -gt 1 ]; then
    if [ "$UNIQUE_HASHES" -eq 1 ]; then
      pass "$COPY_COUNT copies of the shell contract found, and they are identical to each other"
    else
      fail "$COPY_COUNT copies of the shell contract found, but they DIFFER from each other — synchronized-copy drift (see AGENT_REFERENCE.md, Detecting Drift section)"
    fi
  fi
fi
echo "  (Informational only — other *shell*contract* matches, not hashed as code:)"
find . -iname "*shell*contract*" -not -path "*/node_modules/*" -not -name "*.ts" -type f 2>/dev/null | sed 's/^/    /'

echo
echo "============================================================"
echo "3. TEST SUITES — real exit code, no truncation (Rule 7)"
echo "============================================================"
echo "-- JS/TS: discovering test:* scripts from package.json --"
if [ -f package.json ]; then
  TEST_SCRIPTS_JS=$(node -e "console.log(Object.keys(require('./package.json').scripts||{}).filter(s=>s.startsWith('test')).join(' '))" 2>/dev/null)
  if [ -z "$TEST_SCRIPTS_JS" ]; then
    warn "No scripts starting with 'test' found in root package.json"
  else
    echo "  Found: $TEST_SCRIPTS_JS"
    for script in $TEST_SCRIPTS_JS; do
      LOGFILE="/tmp/sovereign_js_${script//:/_}.log"
      npm run "$script" --silent > "$LOGFILE" 2>&1
      EXIT=$?
      if [ "$EXIT" -eq 0 ]; then
        pass "$script — exit code 0"
      else
        fail "$script — exit code $EXIT — full log: $LOGFILE — do NOT treat as passing"
      fi
    done
  fi
else
  warn "No package.json here — run from monorepo root, or pass it as \$1"
fi

echo; echo "-- Python: $PY_TEST_DIR via python3 -m pytest --"
if [ -d "$PY_TEST_DIR" ]; then
  python3 -m pytest "$PY_TEST_DIR" > /tmp/sovereign_py_test_output.log 2>&1
  PY_EXIT=$?
  echo "  Exit code: $PY_EXIT"
  tail -10 /tmp/sovereign_py_test_output.log | sed 's/^/    /'
  [ "$PY_EXIT" -eq 0 ] && pass "Python suite ($PY_TEST_DIR) exit code 0 (real run)" || fail "Python suite exit code $PY_EXIT — full log: /tmp/sovereign_py_test_output.log"
else
  warn "$PY_TEST_DIR not found — confirm Python test location hasn't moved"
fi

echo
echo "============================================================"
echo "4. AGENT REGISTRY COUNT (Lesson 12 — count the file directly)"
echo "============================================================"
AIS_FILE=$(find . -iname "Agent_Identity_Standard.md" -not -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -z "$AIS_FILE" ]; then
  warn "Agent_Identity_Standard.md not found in repo"
else
  echo "  Lines in the file claiming a total:"
  grep -n "Total registered agents" "$AIS_FILE" | sed 's/^/    /'
fi

echo
echo "============================================================"
echo "5. GOVERNANCE ARTIFACTS — do they actually exist in the repo?"
echo "============================================================"
for f in SOVEREIGN_Session38_Handoff.md SBOM_Session38_Update.md \
         SOVEREIGN_Session38_PromptFix_Handoff.md SBOM_Session38_PromptFix_Update.md \
         SOVEREIGN_Walkthrough_F_Findings_Report.md Walkthrough_F_Repeat_Pass.md; do
  FOUND=$(find . -iname "$f" -not -path "*/node_modules/*" 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then pass "$f found: $FOUND"; else warn "$f NOT found as a standalone file"; fi
done

echo
echo "============================================================"
echo "SUMMARY: $PASS pass / $WARN warn / $FAIL fail"
echo "============================================================"
echo "This is evidence for the Project Principal's own determination —"
echo "nothing in this script self-certifies anything as resolved."
