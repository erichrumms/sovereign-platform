#!/bin/bash
# ==============================================================================
# SOVEREIGN Platform — Session 111 Context Gather Script
# Invariant checks in the verify script · SBOM numbering leftover
#
# Convention: AGENT_REFERENCE.md § "Context Gather Script"
#   1. Write to repo root
#   2. chmod +x gather_session111_context.sh
#   3. git add / commit / push
#   4. Run in TERMINAL 2 before opening Build Agent
#   5. Paste clipboard output as the FIRST thing into Build Agent
#   6. Then paste the session opening prompt
#
# Read-only. Confirm "N of N files found. 0 missing." before pasting.
# ==============================================================================

set -u

cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found at ~/Developer/sovereign-platform"; exit 1; }

OUT="$(mktemp)"
FOUND=0
MISSING=0
MISSING_LIST=""

# ---- Session context package ------------------------------------------------
# Filenames verified against SBOM_Session110_Update.md § Component inventory.
FILES=(
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "PLACEMENT_LOG.tsv"
  "SOVEREIGN_Session110_Handoff.md"
  "SBOM_Session110_Update.md"
  "sovereign_session_verify.sh"
)

emit() { printf '%s\n' "$1" >> "$OUT"; }

# ---- Header -----------------------------------------------------------------
emit "================================================================"
emit "SOVEREIGN PLATFORM — SESSION 111 CONTEXT PACKAGE"
emit "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
emit "================================================================"
emit ""
emit "REPO STATE AT GATHER TIME"
emit "  branch : $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
emit "  HEAD   : $(git rev-parse --short HEAD 2>/dev/null)"
emit "  HEAD (full): $(git rev-parse HEAD 2>/dev/null)"
emit "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "COMMIT ATTRIBUTION — settled, not a defect"
emit "  last commit author: $(git log -1 --format='%an <%ae>' 2>/dev/null)"
emit "  Project Principal decision, August 12, 2026: hostname-derived attribution"
emit "  is DELIBERATELY LEFT AS IS. No git config change is authorized."
emit ""
emit "SHELL CONTRACT — both copies, for the Constraint #11 check"
while IFS= read -r f; do
  emit "  $(shasum -a 256 "$f" 2>/dev/null)"
done < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "AGENT_REFERENCE.md"
emit "  lines : $(wc -l < AGENT_REFERENCE.md 2>/dev/null | tr -d ' ')"
emit "  sha256: $(shasum -a 256 AGENT_REFERENCE.md 2>/dev/null | awk '{print $1}')"
emit "  expected at open: 2,109 lines, f6a1aebafec8050dbe4f182800127b5f5ee8f83fa12875f9cede73913d45b09f (v3.8)"
emit ""

# ---- Target script ----------------------------------------------------------
emit "VERIFY SCRIPT — the file being extended this session"
if [ -f "sovereign_session_verify.sh" ]; then
  emit "  lines : $(wc -l < sovereign_session_verify.sh | tr -d ' ')"
  emit "  sha256: $(shasum -a 256 sovereign_session_verify.sh | awk '{print $1}')"
  emit "  Its current full text is included in the context package below."
  emit "  Build Agent runs it itself to establish the real pre-change baseline."
else
  emit "  NOT FOUND — D1 cannot proceed as written. Report and stop."
fi
emit ""

# ---- D2 evidence: SBOM artifacts on disk ------------------------------------
emit "SBOM ARTIFACTS ON DISK — evidence for D2"
for f in SBOM*.md; do
  [ -e "$f" ] || continue
  emit "  ${f}  |  version line: $(grep -m1 -oE 'v1\.[0-9]+' "$f" 2>/dev/null)  |  $(wc -l < "$f" | tr -d ' ') lines"
done
emit ""
emit "================================================================"
emit ""

# ---- Repo context files -----------------------------------------------------
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    FOUND=$((FOUND+1))
    emit "================================================================"
    emit "FILE: $f"
    emit "LINES: $(wc -l < "$f" | tr -d ' ')  SHA256: $(shasum -a 256 "$f" | awk '{print $1}')"
    emit "================================================================"
    cat "$f" >> "$OUT"
    emit ""
    emit ""
  else
    MISSING=$((MISSING+1))
    MISSING_LIST="${MISSING_LIST}\n    ${f}"
    emit "################################################################"
    emit "MISSING: $f — NOT FOUND IN REPO"
    emit "################################################################"
    emit ""
  fi
done

TOTAL=$((FOUND+MISSING))
emit "================================================================"
emit "END OF CONTEXT PACKAGE — ${FOUND} of ${TOTAL} files found, ${MISSING} missing"
emit "================================================================"

cat "$OUT" | pbcopy
cp "$OUT" /tmp/sovereign_session111_context.txt
rm -f "$OUT"

# ---- Terminal report --------------------------------------------------------
echo
echo "SOVEREIGN — Session 111 context gather"
echo "------------------------------------------------------------"
echo "  ${FOUND} of ${TOTAL} files found. ${MISSING} missing."
if [ "$MISSING" != "0" ]; then
  echo
  echo "  MISSING FILES:"
  printf "%b\n" "$MISSING_LIST"
  echo
  echo "  DO NOT PASTE. Resolve the missing files first."
else
  echo "  Context package copied to clipboard."
  echo "  Saved to: /tmp/sovereign_session111_context.txt"
fi
echo "------------------------------------------------------------"
echo "  branch : $(git rev-parse --abbrev-ref HEAD)"
echo "  HEAD   : $(git rev-parse --short HEAD)"
echo "  AGENT_REFERENCE.md: $(wc -l < AGENT_REFERENCE.md | tr -d ' ') lines"
echo "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
echo "------------------------------------------------------------"
echo
echo "  PRECONDITION — confirm before pasting:"
echo "  AGENT_REFERENCE.md v3.8 has been copied to the iCloud root AND"
echo "  re-uploaded to project knowledge. Four sessions running have"
echo "  depended on this step."
echo
echo "  Next: Terminal 1 — launch Build Agent, paste this clipboard,"
echo "  then paste the Session 111 opening prompt."
echo
