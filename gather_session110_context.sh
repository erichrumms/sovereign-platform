#!/bin/bash
# ==============================================================================
# SOVEREIGN Platform — Session 110 Context Gather Script
# Downloads inventory · carried defect fixes · SBOM version collision · manifest gap
#
# Convention: AGENT_REFERENCE.md § "Context Gather Script"
#   1. Write to repo root
#   2. chmod +x gather_session110_context.sh
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
# Filenames verified against SBOM_Session109_Update.md § Component inventory.
FILES=(
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "PLACEMENT_LOG.tsv"
  "SOVEREIGN_Session109_Handoff.md"
  "SBOM_Session109_Update.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.58.md"
)

emit() { printf '%s\n' "$1" >> "$OUT"; }

# ---- Header -----------------------------------------------------------------
emit "================================================================"
emit "SOVEREIGN PLATFORM — SESSION 110 CONTEXT PACKAGE"
emit "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
emit "================================================================"
emit ""
emit "REPO STATE AT GATHER TIME"
emit "  branch : $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
emit "  HEAD   : $(git rev-parse --short HEAD 2>/dev/null)"
emit "  HEAD (full): $(git rev-parse HEAD 2>/dev/null)"
emit "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "COMMIT ATTRIBUTION — standing accepted state, not a defect"
emit "  last commit author: $(git log -1 --format='%an <%ae>' 2>/dev/null)"
emit "  git config user.name : $(git config user.name 2>/dev/null || echo '<unset>')"
emit "  git config user.email: $(git config user.email 2>/dev/null || echo '<unset>')"
emit "  Project Principal decision, August 12, 2026: hostname-derived attribution"
emit "  is DELIBERATELY LEFT AS IS. Do not configure a git identity this session."
emit ""
emit "SHELL CONTRACT — both copies, for the Constraint #11 check"
while IFS= read -r f; do
  emit "  $(shasum -a 256 "$f" 2>/dev/null)"
done < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "TARGET FILE"
emit "  AGENT_REFERENCE.md: $(wc -l < AGENT_REFERENCE.md 2>/dev/null | tr -d ' ') lines"
emit "  sha256: $(shasum -a 256 AGENT_REFERENCE.md 2>/dev/null | awk '{print $1}')"
emit "  expected at open: 2,061 lines, 2d3f02ca591b548ec68f1a5d9919bc446e328b59553cb74770993933c46fb842"
emit ""

# ---- D4 evidence: every SBOM artifact in the repo ---------------------------
emit "SBOM LINEAGE INVENTORY — evidence for D4 (version collision)"
emit "  Per-session updates and merged registries, as they really exist on disk:"
for f in SBOM*.md; do
  [ -e "$f" ] || continue
  emit "    ${f}"
  emit "      lines: $(wc -l < "$f" | tr -d ' ')  version line: $(grep -m1 -oE 'v1\.[0-9]+' "$f" 2>/dev/null)"
done
emit ""

# ---- D1 scope sizing (count only — the real inventory is D1's job) ---------
emit "DOWNLOADS FOLDER — reachability check only"
if [ -d "$HOME/Downloads" ]; then
  emit "  ~/Downloads reachable."
  emit "  Files matching SOVEREIGN/AGENT/docs governance patterns: $(ls -1 "$HOME/Downloads" 2>/dev/null | grep -cE 'SOVEREIGN|AGENT_|Agent_|SBOM|^docs' )"
  emit "  The real inventory — line counts, checksums, timestamps, repo comparison —"
  emit "  is deliverable D1 and is performed by Build Agent, not here."
else
  emit "  ~/Downloads NOT REACHABLE — D1 cannot run."
fi
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
cp "$OUT" /tmp/sovereign_session110_context.txt
rm -f "$OUT"

# ---- Terminal report --------------------------------------------------------
echo
echo "SOVEREIGN — Session 110 context gather"
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
  echo "  Saved to: /tmp/sovereign_session110_context.txt"
fi
echo "------------------------------------------------------------"
echo "  branch : $(git rev-parse --abbrev-ref HEAD)"
echo "  HEAD   : $(git rev-parse --short HEAD)"
echo "  AGENT_REFERENCE.md: $(wc -l < AGENT_REFERENCE.md | tr -d ' ') lines"
echo "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
echo "------------------------------------------------------------"
echo
echo "  PRECONDITION — confirm before pasting:"
echo "  AGENT_REFERENCE.md v3.7 has been copied to the iCloud root AND"
echo "  re-uploaded to project knowledge. Three sessions running have"
echo "  depended on this step. If it has not been done, do it first."
echo
echo "  Next: Terminal 1 — launch Build Agent, paste this clipboard,"
echo "  then paste the Session 110 opening prompt."
echo
