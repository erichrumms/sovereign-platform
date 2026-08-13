#!/usr/bin/env bash
# ============================================================
# SOVEREIGN Platform — Session Verification Script
# Authored by: Governance Agent · July 17, 2026 (v2 — corrected after first real run)
# Updated: Session 43 · July 19, 2026 (v3 — HEAD + hash advanced)
# Updated: Session 51 · July 20, 2026 (v4 — hash advanced; v1.20 / GD-25)
# Updated: Session 111 · August 12, 2026 (v5 — four invariant checks added; six
#   standing warnings resolved; HEAD check made informational; KNOWN_CONTRACT_HASH
#   updated to v1.28; Walkthrough F check updated; see handoff SOVEREIGN_Session111_Handoff.md)
# Run at session open AND as a required close step (D1b, Session 111).
# ============================================================
#
# Checks:
#  1. Git state — HEAD informational; tracked-file modifications; anchor commits
#  2. Shell contract hash — both copies vs documented v1.28 hash
#  3. Test suites — real exit codes, no truncation (Rule 7)
#  4. Agent registry count (Lesson 12 — count the file directly)
#  5. Governance artifacts — key session-38 files and Walkthrough F exist
#  6. [NEW] Manifest-to-disk integrity — every DOCUMENT_MANIFEST.tsv repo/repo_docs
#          entry verified for existence and SHA-256 match
#  7. [NEW] Version-chain continuity — AGENT_REFERENCE.md Supersedes chain vs changelog
#          entries; detects skip-a-version defect that appeared in v3.5 and v3.7
#  8. [NEW] SBOM count accuracy — most recent SBOM update's stated counts vs actual
#          counts from this run's Section 3 logs
#  9. [NEW] PLACEMENT_LOG referenced-file existence — current vs historical records
#
# Design note (D1c, Session 111): a check that always warns is a check people stop
# reading — that is Rule 17's exact subject. The six standing warnings in v4 were:
#  (1) HEAD mismatch — EXPECTED_HEAD variable never updated since Session 43.
#      Fixed: HEAD is now informational only; no expected value to go stale.
#  (2) Working tree uncommitted changes — pull_category3_docs_to_icloud.sh (untracked).
#      Fixed: check now filters out untracked files (??), which are not the same
#      concern as uncommitted modifications to tracked files.
#  (3)+(4) Shell contract "does NOT match documented v1.20 hash" — EXPECTED_CONTRACT_HASH
#      was set to a v1.20 value and not updated when the contract advanced to v1.28.
#      Fixed: KNOWN_CONTRACT_HASH updated to v1.28 actual hash.
#  (5)+(6) SOVEREIGN_Walkthrough_F_Findings_Report.md and Walkthrough_F_Repeat_Pass.md
#      not found — these were compiled into SOVEREIGN_Walkthrough_F_Complete.md in
#      Session 24; the check was never updated.
#      Fixed: check now looks for SOVEREIGN_Walkthrough_F_Complete.md.
#
# Run:
#   chmod +x sovereign_session_verify.sh
#   ./sovereign_session_verify.sh [path-to-repo-root]
# ============================================================

KNOWN_CONTRACT_HASH="c99355cea43b63672615e76551aa835c3eb73a2f6435fbc43665f67d50ec681b"  # v1.28
KNOWN_CONTRACT_PATHS="./sovereign-shell/shell-contract.ts ./shell-contract.ts"
PY_TEST_DIR="./sovereign-security"
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
  echo "  INFO: HEAD is $(git rev-parse --short HEAD) ($(git rev-parse HEAD))"
  echo "  (HEAD is informational — terminal HEAD is recorded in DOCUMENT_MANIFEST.tsv at close)"

  DIRTY=$(git status --porcelain | grep -v "sovereign_session_verify.sh" | grep -v "^??")
  if [ -z "$DIRTY" ]; then
    pass "Working tree: no uncommitted tracked-file changes"
  else
    warn "Working tree has uncommitted tracked-file changes:"; echo "$DIRTY" | sed 's/^/    /'
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
    if [ "$H" = "$KNOWN_CONTRACT_HASH" ]; then
      pass "$f matches documented v1.28 hash"
    else
      fail "$f hash is $H — does NOT match documented v1.28 hash ($KNOWN_CONTRACT_HASH)"
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
JS_TOTAL=0
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
        count=$(grep "^Tests:" "$LOGFILE" 2>/dev/null | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+')
        [ -n "$count" ] && JS_TOTAL=$((JS_TOTAL + count))
        pass "$script — exit code 0"
      else
        fail "$script — exit code $EXIT — full log: $LOGFILE — do NOT treat as passing"
      fi
    done
    echo "  JS/TS total from this run: $JS_TOTAL"
  fi
else
  warn "No package.json here — run from monorepo root, or pass it as \$1"
fi

echo; echo "-- Python: $PY_TEST_DIR via python3 -m pytest --"
PY_TOTAL=0
if [ -d "$PY_TEST_DIR" ]; then
  python3 -m pytest "$PY_TEST_DIR" > /tmp/sovereign_py_test_output.log 2>&1
  PY_EXIT=$?
  echo "  Exit code: $PY_EXIT"
  tail -10 /tmp/sovereign_py_test_output.log | sed 's/^/    /'
  if [ "$PY_EXIT" -eq 0 ]; then
    PY_TOTAL=$(grep -oE '[0-9]+ passed' /tmp/sovereign_py_test_output.log | tail -1 | grep -oE '[0-9]+')
    [ -z "$PY_TOTAL" ] && PY_TOTAL=0
    pass "Python suite ($PY_TEST_DIR) exit code 0 (real run)"
  else
    fail "Python suite exit code $PY_EXIT — full log: /tmp/sovereign_py_test_output.log"
  fi
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
         SOVEREIGN_Walkthrough_F_Complete.md; do
  FOUND=$(find . -iname "$f" -not -path "*/node_modules/*" 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then pass "$f found: $FOUND"; else fail "$f NOT found"; fi
done

echo
echo "============================================================"
echo "6. MANIFEST-TO-DISK INTEGRITY (DOCUMENT_MANIFEST.tsv)"
echo "============================================================"
# For every repo/repo_docs row: verify the file exists on disk and its SHA-256
# matches the recorded value. Reports each mismatch and missing file by name.
# icloud and project_knowledge rows are skipped (not scriptably verifiable).
# This check catches: file updated after manifest was last edited; file placed at
# wrong path; file deleted or replaced without updating the manifest.
if [ ! -f DOCUMENT_MANIFEST.tsv ]; then
  fail "DOCUMENT_MANIFEST.tsv not found — cannot run integrity check"
else
  m_checked=0; m_ok=0
  m_errors=()
  while IFS='|' read -r fname dest sha rest; do
    fname="${fname// /}"; dest="${dest// /}"; sha="${sha// /}"
    [[ "$fname" =~ ^# ]] && continue
    [[ -z "$fname" ]] && continue
    [ ${#sha} -ne 64 ] && continue  # skip rows without a valid SHA-256 field
    case "$dest" in
      repo)      fpath="$REPO_ROOT/$fname" ;;
      repo_docs)
        if [[ "$fname" == docs/* ]]; then fpath="$REPO_ROOT/$fname"
        else fpath="$REPO_ROOT/docs/$fname"; fi ;;
      *) continue ;;
    esac
    m_checked=$((m_checked + 1))
    if [ ! -f "$fpath" ]; then
      m_errors+=("MISSING: $fname")
    else
      actual=$(sha256sum "$fpath" | awk '{print $1}')
      if [ "$actual" = "$sha" ]; then
        m_ok=$((m_ok + 1))
      else
        m_errors+=("SHA MISMATCH: $fname (recorded ${sha:0:16}… actual ${actual:0:16}…)")
      fi
    fi
  done < <(grep -v '^#' DOCUMENT_MANIFEST.tsv | grep '|')
  if [ ${#m_errors[@]} -eq 0 ]; then
    pass "Manifest integrity: $m_checked file(s) checked — all present with matching SHA-256"
  else
    fail "Manifest integrity: ${#m_errors[@]} error(s) across $m_checked file(s) checked"
    for err in "${m_errors[@]}"; do echo "    $err"; done
    echo "  Action: do not fix the underlying file this session — report the finding."
    echo "  (Rule 17: a check firing on its first real run is the check working.)"
  fi
fi

echo
echo "============================================================"
echo "7. VERSION-CHAIN CONTINUITY (AGENT_REFERENCE.md)"
echo "============================================================"
# Verifies the Supersedes chain includes every version that has a changelog entry.
# The defect this catches appeared in v3.5 (skipped v3.3 and v3.4) and again in
# v3.7 (skipped v3.6). Both were corrected the following session — a recurring
# pattern this check is designed to detect at close time, not the next session open.
if [ ! -f AGENT_REFERENCE.md ]; then
  fail "AGENT_REFERENCE.md not found"
else
  # Read the full multi-line Supersedes block (to **Merge decision:**); first-line-only
  # grep missed v3.1–v3.5 on first real run (Session 111) — block wraps across many lines.
  CHAIN_VERS=$(awk '/^\*\*Supersedes:\*\*/{found=1} /^\*\*Merge decision:\*\*/{found=0} found' AGENT_REFERENCE.md | grep -oE 'v[0-9]+\.[0-9]+' | sort -V | uniq)
  # Include the current version — it does not appear in its own Supersedes chain.
  CURRENT_VER="v$(grep '^\*\*Version:' AGENT_REFERENCE.md | head -1 | grep -oE '[0-9]+\.[0-9]+' | head -1)"
  if [ -n "$CURRENT_VER" ] && [ "$CURRENT_VER" != "v" ]; then
    CHAIN_VERS=$(printf '%s\n%s' "$CHAIN_VERS" "$CURRENT_VER" | sort -V | uniq)
  fi
  CHANGELOG_VERS=$(grep -oE '^\*\*v[0-9]+\.[0-9]+ change:\*\*' AGENT_REFERENCE.md | grep -oE 'v[0-9]+\.[0-9]+' | sort -V)

  if [ -z "$CHAIN_VERS" ]; then
    warn "Could not extract versions from Supersedes line — verify AGENT_REFERENCE.md header format"
  elif [ -z "$CHANGELOG_VERS" ]; then
    warn "Could not extract changelog versions from AGENT_REFERENCE.md"
  else
    MISSING=$(comm -23 <(echo "$CHANGELOG_VERS") <(echo "$CHAIN_VERS"))
    if [ -z "$MISSING" ]; then
      pass "Version-chain continuity: all changelog entries appear in the Supersedes chain"
    else
      fail "Version-chain has gap(s) — changelog entries NOT in Supersedes chain: $MISSING"
    fi
  fi
fi

echo
echo "============================================================"
echo "8. SBOM COUNT ACCURACY"
echo "============================================================"
# Compares the most recent SBOM update's stated test count against the actual
# counts derived from Section 3's real test run in this same script execution.
# If Section 3 did not run (JS_TOTAL=0 and PY_TOTAL=0), the comparison is skipped.
LATEST_SBOM=$(ls SBOM_Session*_Update.md 2>/dev/null | sort -V | tail -1)
if [ -z "$LATEST_SBOM" ]; then
  warn "No SBOM_Session*_Update.md found — cannot verify stated count"
else
  echo "  Most recent SBOM: $LATEST_SBOM"
  SBOM_JS=$(grep '| JS/TS' "$LATEST_SBOM" 2>/dev/null | grep -oE '[0-9,]+' | tr -d ',' | sort -rn | head -1)
  SBOM_PY=$(grep '| Python' "$LATEST_SBOM" 2>/dev/null | grep -oE '[0-9]+' | sort -rn | head -1)
  echo "  SBOM states: JS/TS=${SBOM_JS:-unknown}  Python=${SBOM_PY:-unknown}"
  echo "  Actual from this run: JS/TS=$JS_TOTAL  Python=$PY_TOTAL"

  if [ -z "$SBOM_JS" ] || [ -z "$SBOM_PY" ]; then
    warn "Could not extract counts from SBOM — verify the SBOM table format"
  elif [ "$JS_TOTAL" -eq 0 ] && [ "$PY_TOTAL" -eq 0 ]; then
    warn "Actual counts are 0 — Section 3 may not have run; cannot verify SBOM count"
  elif [ "$JS_TOTAL" = "$SBOM_JS" ] && [ "$PY_TOTAL" = "$SBOM_PY" ]; then
    PLATFORM_TOTAL=$((JS_TOTAL + PY_TOTAL))
    pass "SBOM count matches: JS/TS $JS_TOTAL + Python $PY_TOTAL = $PLATFORM_TOTAL"
  else
    fail "SBOM count mismatch: SBOM says JS/TS=$SBOM_JS Python=$SBOM_PY but actual is JS/TS=$JS_TOTAL Python=$PY_TOTAL"
  fi
fi

echo
echo "============================================================"
echo "9. PLACEMENT_LOG REFERENCED-FILE EXISTENCE"
echo "============================================================"
# PLACEMENT_LOG.tsv is a permanent historical record of all document placements.
# Files not on disk are expected for superseded versions — their absence is not a
# failure. Files that are current (also in DOCUMENT_MANIFEST.tsv) must exist, and
# any mismatch there is reported as a FAIL in Section 6, not here.
# This section reports counts and lists absent files as informational context.
if [ ! -f PLACEMENT_LOG.tsv ]; then
  warn "PLACEMENT_LOG.tsv not found"
else
  pl_total=0; pl_present=0
  pl_absent=()
  while IFS=$'\t' read -r fname rest; do
    fname="${fname// /}"
    [[ -z "$fname" ]] && continue
    pl_total=$((pl_total + 1))
    if [[ "$fname" == docs/* ]]; then fpath="$REPO_ROOT/$fname"
    elif [ -f "$REPO_ROOT/$fname" ]; then fpath="$REPO_ROOT/$fname"
    elif [ -f "$REPO_ROOT/docs/$fname" ]; then fpath="$REPO_ROOT/docs/$fname"
    else fpath="$REPO_ROOT/$fname"
    fi
    if [ -f "$fpath" ]; then
      pl_present=$((pl_present + 1))
    else
      pl_absent+=("$fname")
    fi
  done < <(grep -v '^$' PLACEMENT_LOG.tsv)
  pl_absent_count=${#pl_absent[@]}
  pass "PLACEMENT_LOG: $pl_present of $pl_total placement entries have files on disk"
  if [ "$pl_absent_count" -gt 0 ]; then
    echo "  INFO: $pl_absent_count entr(ies) not on disk — expected for superseded versions:"
    printf '    %s\n' "${pl_absent[@]}"
  fi
fi

echo
echo "============================================================"
echo "SUMMARY: $PASS pass / $WARN warn / $FAIL fail"
echo "============================================================"
echo "This is evidence for the Project Principal's own determination —"
echo "nothing in this script self-certifies anything as resolved."
echo "(Rule 17: a check's existence is not evidence of its continued use —"
echo "  run this script and quote its FULL output in the handoff every close.)"
