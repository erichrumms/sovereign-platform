#!/usr/bin/env bash
# ============================================================
# SOVEREIGN Platform — Platform Map / Orientation Script
# Authored by: Governance Agent · July 17, 2026
# Run in Terminal 2 (Terminal 1 is reserved for the Build Agent)
# ============================================================
#
# Different purpose than sovereign_session_verify.sh: that script checks
# specific claims (a commit, a hash, a test count). This one builds the
# actual picture underneath — repo layout, where governance docs really
# live vs. where AGENT_REFERENCE.md's File Location Reference says they
# should, and whether every prompt file Agent_Identity_Standard.md says
# is REQUIRED actually EXISTS (the same failure class as WF-10, checked
# once across the whole registry instead of assumed fixed).
#
# All read-only. Nothing here writes, moves, or deletes anything.
#
# Run:
#   chmod +x sovereign_platform_map.sh
#   ./sovereign_platform_map.sh [path-to-repo-root]
# ============================================================

DEFAULT_REPO_ROOT="$HOME/Developer/sovereign-platform"
set -uo pipefail

REPO_ROOT="${1:-$DEFAULT_REPO_ROOT}"
if [ ! -d "$REPO_ROOT" ]; then
  echo "FAIL: $REPO_ROOT does not exist."
  exit 1
fi
cd "$REPO_ROOT" || { echo "FAIL: cannot cd into $REPO_ROOT"; exit 1; }
echo "Running against: $(pwd)"
echo

echo "============================================================"
echo "1. TOP-LEVEL REPO STRUCTURE (2 levels, no node_modules/.git)"
echo "============================================================"
find . -maxdepth 2 -not -path '*/node_modules*' -not -path '*/.git*' -not -path '.' \
  | sort | sed 's/^/  /'

echo
echo "============================================================"
echo "2. DECLARED WORKSPACES (root package.json)"
echo "============================================================"
if [ -f package.json ]; then
  node -e "const p=require('./package.json'); console.log((p.workspaces||[]).join('\n'))" 2>/dev/null \
    | sed 's/^/  /'
else
  echo "  No root package.json found"
fi

echo
echo "============================================================"
echo "3. GOVERNANCE / GUIDANCE DOCUMENTS — location + stated version"
echo "============================================================"
echo "-- Integration Brief --"
find . -iname "*integration*brief*" -not -path "*/node_modules/*" -type f 2>/dev/null | while read -r f; do
  echo "  $f"
  grep -m1 -Eio "v[0-9]+\.[0-9]+" "$f" | head -1 | sed 's/^/    version string found: /'
done

echo "-- Strategic Plan --"
find . -iname "*strategic*plan*" -not -path "*/node_modules/*" -type f 2>/dev/null | while read -r f; do
  echo "  $f"
  grep -m1 -Eio "v[0-9]+\.[0-9]+" "$f" | head -1 | sed 's/^/    version string found: /'
done

echo "-- AGENT_REFERENCE.md / Agent_Identity_Standard.md (repo copies) --"
find . -iname "AGENT_REFERENCE.md" -o -iname "Agent_Identity_Standard.md" 2>/dev/null | grep -v node_modules | sed 's/^/  /'

echo "-- Architecture specs (docs/16, 17, 18) --"
find . -iname "*ARIA_Suite_Architecture*" -o -iname "*TimeAndTravel_Architecture*" -o -iname "*PPBE_Workflow_Architecture*" 2>/dev/null \
  | grep -v node_modules | sed 's/^/  /'

echo
echo "============================================================"
echo "4. DOCUMENT PLACEMENT TOOLING (per New Conversation Handoff)"
echo "============================================================"
for f in DOCUMENT_MANIFEST.tsv place_governance_doc.sh; do
  FOUND=$(find . -iname "$f" -not -path "*/node_modules/*" 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then
    echo "  FOUND: $FOUND"
  else
    echo "  NOT FOUND: $f"
  fi
done
MANIFEST=$(find . -iname "DOCUMENT_MANIFEST.tsv" -not -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -n "$MANIFEST" ]; then
  echo "  -- Manifest header + row count --"
  head -1 "$MANIFEST" | sed 's/^/    /'
  echo "    ($(($(wc -l < "$MANIFEST") - 1)) data rows)"
fi

echo
echo "============================================================"
echo "5. GATHER SCRIPT — is the committed one current?"
echo "============================================================"
find . -iname "*gather*.sh" -not -path "*/node_modules/*" -type f 2>/dev/null | sed 's/^/  /'

echo
echo "============================================================"
echo "6. PROMPT REGISTRY CROSS-CHECK — required (per Agent_Identity_"
echo "   Standard.md) vs. actually present on disk"
echo "============================================================"
AIS_FILE=$(find . -iname "Agent_Identity_Standard.md" -not -path "*/node_modules/*" 2>/dev/null | head -1)
if [ -z "$AIS_FILE" ]; then
  echo "  Agent_Identity_Standard.md not found — cannot cross-check"
else
  REQUIRED=$(grep -oE '`[a-zA-Z0-9_-]+/prompts/[a-zA-Z0-9_.-]+\.md`' "$AIS_FILE" | tr -d '`' | sort -u)
  TOTAL=0; MISSING=0
  echo "$REQUIRED" | while read -r p; do
    [ -z "$p" ] && continue
    if [ -f "$p" ]; then
      echo "  PRESENT: $p"
    else
      echo "  MISSING: $p  <-- registered as required, not found on disk"
    fi
  done
  echo
  echo "  -- All *_system.md prompt files that actually exist on disk (for comparison) --"
  find . -path "*/prompts/*_system.md" -not -path "*/node_modules/*" 2>/dev/null | sort | sed 's/^/  /'
fi

echo
echo "============================================================"
echo "7. SESSION HANDOFFS AND SBOM — per File Location Reference"
echo "============================================================"
echo "-- All Session Handoff-shaped files --"
find . -iname "*Session*Handoff*" -not -path "*/node_modules/*" -type f 2>/dev/null | sed 's/^/  /'
echo "-- All SBOM-shaped files --"
find . -iname "*SBOM*" -not -path "*/node_modules/*" -type f 2>/dev/null | sed 's/^/  /'

echo
echo "============================================================"
echo "Done. This is orientation, not a pass/fail check — read it,"
echo "don't treat silence on any line as confirmation of anything."
echo "============================================================"
