#!/bin/bash
# ==============================================================================
# SOVEREIGN Platform — Session 108 Context Gather Script
# AGENT_REFERENCE.md v3.6 — recovery of content from the parallel v3.4/v3.5 lineage
#
# Convention: AGENT_REFERENCE.md § "Context Gather Script"
#   1. Write to repo root
#   2. chmod +x gather_session108_context.sh
#   3. git add / commit / push
#   4. Run in TERMINAL 2 before opening Build Agent
#   5. Paste clipboard output as the FIRST thing into Build Agent
#   6. Then paste the session opening prompt
#
# Read-only. Concatenates context files, reports found vs. missing, copies to
# clipboard. Confirm "N of N files found. 0 missing." before pasting.
# ==============================================================================

set -u

cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found at ~/Developer/sovereign-platform"; exit 1; }

OUT="$(mktemp)"
FOUND=0
MISSING=0
MISSING_LIST=""

RECOVERY="$HOME/Downloads/AGENT_REFERENCE_v36_recovery_content.md"
RECOVERY_SHA_EXPECTED="a7d082ac010b036d40cdb7a0d0284c98bae815c74ffd4e765edd9ac1ad671131"

# ---- Session context package ------------------------------------------------
# Filenames verified against SBOM_Session107_Update.md § Files changed.
FILES=(
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "PLACEMENT_LOG.tsv"
  "SOVEREIGN_Session107_Handoff.md"
  "SBOM_Session107_Update.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.58.md"
)

emit() { printf '%s\n' "$1" >> "$OUT"; }

# ---- Header -----------------------------------------------------------------
emit "================================================================"
emit "SOVEREIGN PLATFORM — SESSION 108 CONTEXT PACKAGE"
emit "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
emit "================================================================"
emit ""
emit "REPO STATE AT GATHER TIME"
emit "  branch : $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
emit "  HEAD   : $(git rev-parse --short HEAD 2>/dev/null)"
emit "  HEAD (full): $(git rev-parse HEAD 2>/dev/null)"
emit "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "SHELL CONTRACT — both copies, for the Constraint #11 check"
while IFS= read -r f; do
  emit "  $(shasum -a 256 "$f" 2>/dev/null)"
done < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "TARGET FILE"
emit "  AGENT_REFERENCE.md: $(wc -l < AGENT_REFERENCE.md 2>/dev/null | tr -d ' ') lines"
emit "  sha256: $(shasum -a 256 AGENT_REFERENCE.md 2>/dev/null | awk '{print $1}')"
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

# ---- Recovery content file (staged in Downloads, not the repo) --------------
emit "================================================================"
emit "FILE: AGENT_REFERENCE_v36_recovery_content.md  (staged in ~/Downloads)"
emit "================================================================"
if [ -f "$RECOVERY" ]; then
  FOUND=$((FOUND+1))
  R_SHA="$(shasum -a 256 "$RECOVERY" | awk '{print $1}')"
  R_MTIME="$(stat -f '%Sm' "$RECOVERY" 2>/dev/null)"
  emit "LINES: $(wc -l < "$RECOVERY" | tr -d ' ')  (expected 131)"
  emit "SHA256:   ${R_SHA}"
  emit "EXPECTED: ${RECOVERY_SHA_EXPECTED}"
  if [ "$R_SHA" = "$RECOVERY_SHA_EXPECTED" ]; then
    emit "CHECKSUM: MATCH"
  else
    emit "CHECKSUM: MISMATCH — do not use this file; re-download it."
  fi
  emit "MODIFIED: ${R_MTIME}"
  emit "Rule 10 amendment check: confirm this timestamp is from THIS transfer,"
  emit "not an earlier one. A checksum computed against the wrong reference set"
  emit "passes cleanly and proves nothing."
  emit "----------------------------------------------------------------"
  cat "$RECOVERY" >> "$OUT"
  emit ""
else
  MISSING=$((MISSING+1))
  MISSING_LIST="${MISSING_LIST}\n    ~/Downloads/AGENT_REFERENCE_v36_recovery_content.md"
  emit "MISSING — NOT FOUND. Build Agent cannot perform D1 without this file."
  emit ""
fi

TOTAL=$((FOUND+MISSING))
emit "================================================================"
emit "END OF CONTEXT PACKAGE — ${FOUND} of ${TOTAL} files found, ${MISSING} missing"
emit "================================================================"

cat "$OUT" | pbcopy
cp "$OUT" /tmp/sovereign_session108_context.txt
rm -f "$OUT"

# ---- Terminal report --------------------------------------------------------
echo
echo "SOVEREIGN — Session 108 context gather"
echo "------------------------------------------------------------"
echo "  ${FOUND} of ${TOTAL} files found. ${MISSING} missing."
if [ "$MISSING" != "0" ]; then
  echo
  echo "  MISSING FILES:"
  printf "%b\n" "$MISSING_LIST"
  echo
  echo "  DO NOT PASTE. A missing file means Build Agent works without"
  echo "  critical context. Resolve the missing files first."
else
  echo "  Context package copied to clipboard."
  echo "  Saved to: /tmp/sovereign_session108_context.txt"
fi
echo "------------------------------------------------------------"
echo "  branch : $(git rev-parse --abbrev-ref HEAD)"
echo "  HEAD   : $(git rev-parse --short HEAD)"
echo "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
echo "------------------------------------------------------------"
echo
echo "  Next: Terminal 1 — launch Build Agent, paste this clipboard first,"
echo "  then paste the Session 108 opening prompt."
echo
