#!/usr/bin/env bash
# SOVEREIGN Platform — Step 4/5 Completion Check
#
# Checks whether the iCloud placement (Step 4) and repo-root cleanup
# (Step 5) from the July 18 cleanup cycle actually completed — reads
# real filesystem/git state, doesn't trust anything carried forward.
#
# bash 3.2 compatible. Read-only — makes no changes.
#
# Usage: ./check_steps_4_5.sh [repo_root]
# Default repo_root: current directory

set -uo pipefail

REPO="${1:-.}"
cd "$REPO" || { echo "FAIL: cannot cd to $REPO"; exit 1; }

ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs/7 - SOVEREIGN"
EXPECTED_AGENT_REF_HASH="db93a631c59d6d7c141d6be2e469c0395da4e4efc363e3d2cddf88c11c35ad55"

PASS=0; WARN=0; FAIL=0
pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

echo "=== Step 4/5 Completion Check ==="
echo "Repo: $(pwd)"
echo "iCloud target: $ICLOUD"
echo ""

echo "============================================================"
echo "STEP 4 — iCloud placement"
echo "============================================================"

if [ ! -d "$ICLOUD" ]; then
  fail "iCloud '7 - SOVEREIGN' folder not found at expected path"
else
  echo "-- AGENT_REFERENCE.md v3.0 copied to iCloud root --"
  if [ -f "$ICLOUD/AGENT_REFERENCE.md" ]; then
    ACTUAL=$(shasum -a 256 "$ICLOUD/AGENT_REFERENCE.md" 2>/dev/null | awk '{print $1}')
    if [ "$ACTUAL" = "$EXPECTED_AGENT_REF_HASH" ]; then
      pass "iCloud root AGENT_REFERENCE.md matches v3.0 exactly"
    else
      fail "iCloud root AGENT_REFERENCE.md exists but hash differs (got $ACTUAL, expected $EXPECTED_AGENT_REF_HASH) — likely still the old v2.0 or an even older copy"
    fi
  else
    fail "No AGENT_REFERENCE.md at iCloud root"
  fi

  echo ""
  echo "-- Three SBOM files moved OUT of Companion Suite/Governance --"
  GOV="$ICLOUD/Companion Suite/Governance"
  for f in SBOM_Registry_v1.38.md SBOM_Registry_v1.39.md SBOM_Registry_v1.8_MERGED.md; do
    if [ -f "$GOV/$f" ]; then
      fail "$f still present in Governance/ — not moved"
    else
      pass "$f no longer in Governance/"
    fi
  done

  echo ""
  echo "-- Same three files present IN For Disposal --"
  DISPOSAL="$ICLOUD/For Disposal"
  if [ ! -d "$DISPOSAL" ]; then
    fail "For Disposal folder does not exist"
  else
    for f in SBOM_Registry_v1.38.md SBOM_Registry_v1.39.md SBOM_Registry_v1.8_MERGED.md; do
      if [ -f "$DISPOSAL/$f" ]; then
        pass "$f present in For Disposal/"
      else
        fail "$f NOT found in For Disposal/ — may be lost, check Governance/ above before assuming so"
      fi
    done
  fi
fi

echo ""
echo "============================================================"
echo "STEP 5 — repo root cleanup"
echo "============================================================"

echo "-- Git log: is there a cleanup commit after 1e0023d? --"
if git log --oneline 1e0023d..HEAD 2>/dev/null | grep -qi "disposal\|cleanup"; then
  pass "A disposal/cleanup commit exists after 1e0023d:"
  git log --oneline 1e0023d..HEAD 2>/dev/null | grep -i "disposal\|cleanup" | sed 's/^/    /'
else
  warn "No commit after 1e0023d mentions disposal/cleanup — Step 5 may not have been committed yet"
fi

echo ""
echo "-- Working tree clean? --"
DIRTY=$(git status --porcelain 2>/dev/null)
if [ -z "$DIRTY" ]; then
  pass "Working tree clean"
else
  warn "Working tree has uncommitted changes:"
  echo "$DIRTY" | sed 's/^/    /'
fi

echo ""
echo "-- Specific files that should be GONE from repo root --"
for f in SOVEREIGN_System_Prompt_v8.md SOVEREIGN_System_Prompt_v9.md \
         SBOM_Registry.md SBOM_Registry_v1_15_MERGED.md \
         SBOM_Registry_v1_16_MERGED.md SBOM_Registry_v1_17_MERGED.md \
         Agent_Identity_Standard_v1_3.md; do
  if [ -f "$f" ]; then
    fail "$f still present at repo root — should have been moved"
  else
    pass "$f correctly absent"
  fi
done

echo ""
echo "-- Integration Brief count at root (should be exactly 1: v1.47) --"
BRIEF_COUNT=$(ls -1 SOVEREIGN_Platform_Integration_Brief_v1*.md 2>/dev/null | wc -l | tr -d ' ')
BRIEF_LIST=$(ls -1 SOVEREIGN_Platform_Integration_Brief_v1*.md 2>/dev/null)
if [ "$BRIEF_COUNT" = "1" ] && echo "$BRIEF_LIST" | grep -q "v1.47"; then
  pass "Exactly one Integration Brief at root: v1.47"
else
  fail "$BRIEF_COUNT Integration Brief file(s) at root (expected 1, v1.47 only):"
  echo "$BRIEF_LIST" | sed 's/^/    /'
fi

echo ""
echo "============================================================"
echo "SUMMARY: $PASS pass / $WARN warn / $FAIL fail"
echo "============================================================"
if [ "$FAIL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
  echo "Both Step 4 and Step 5 appear fully complete."
elif [ "$FAIL" -eq 0 ]; then
  echo "No hard failures, but review the WARN(s) above before considering this closed."
else
  echo "At least one step is genuinely incomplete — see FAIL lines above."
fi
