#!/bin/bash
# ==============================================================================
# SOVEREIGN Platform — Session 109 Context Gather Script
# AGENT_REFERENCE.md v3.7 (Rules 13/14 resolution) + manifest remediation
#
# Convention: AGENT_REFERENCE.md § "Context Gather Script"
#   1. Write to repo root
#   2. chmod +x gather_session109_context.sh
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

RECOVERY="$HOME/Downloads/AGENT_REFERENCE_v37_rules_recovery_content.md"
RECOVERY_SHA_EXPECTED="8b0b91afe08ea6334593955cb5efef1b0b9342dd37eee6516e4e6e5614f639a8"
PARALLEL="$HOME/Downloads/AGENT_REFERENCE_v3.5.md"
PARALLEL_SHA_EXPECTED="14aa83ad9b7cb14e51b45723cb479e09f37c84b9644fb1417e22873ecdfb6e49"

# ---- Session context package ------------------------------------------------
# Filenames verified against SBOM_Session108_Update.md § Files changed.
FILES=(
  "AGENT_REFERENCE.md"
  "Agent_Identity_Standard.md"
  "DOCUMENT_MANIFEST.tsv"
  "PLACEMENT_LOG.tsv"
  "SOVEREIGN_Session108_Handoff.md"
  "SBOM_Session108_Update.md"
  "SOVEREIGN_Platform_Integration_Brief_v1.58.md"
)

emit() { printf '%s\n' "$1" >> "$OUT"; }

# ---- Header -----------------------------------------------------------------
emit "================================================================"
emit "SOVEREIGN PLATFORM — SESSION 109 CONTEXT PACKAGE"
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
emit "  expected at open: 2,006 lines, a1d567d825a25d7ffb495e764ddfbf648cfd5e620eee1f0c51eb95439bfbddac"
emit ""
emit "LESSON NUMBERING — for the D2 next-free-number check"
emit "  Lesson headings currently in the file:"
emit "$(grep -c '^### Lesson ' AGENT_REFERENCE.md 2>/dev/null) total"
emit "  Highest: $(grep -o '^### Lesson [0-9]*' AGENT_REFERENCE.md 2>/dev/null | grep -o '[0-9]*' | sort -n | tail -1)"
emit ""
emit "MANIFEST SCALE — for the D5 remediation"
emit "  DOCUMENT_MANIFEST.tsv rows: $(wc -l < DOCUMENT_MANIFEST.tsv 2>/dev/null | tr -d ' ')"
emit "  PLACEMENT_LOG.tsv rows:     $(wc -l < PLACEMENT_LOG.tsv 2>/dev/null | tr -d ' ')"
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

# ---- Staged files in Downloads ---------------------------------------------
stage_file() {
  local path="$1" label="$2" expected="$3" inline="$4"
  emit "================================================================"
  emit "FILE: ${label}  (staged in ~/Downloads, not in repo)"
  emit "================================================================"
  if [ -f "$path" ]; then
    FOUND=$((FOUND+1))
    local sha; sha="$(shasum -a 256 "$path" | awk '{print $1}')"
    emit "LINES: $(wc -l < "$path" | tr -d ' ')"
    emit "SHA256:   ${sha}"
    emit "EXPECTED: ${expected}"
    if [ "$sha" = "$expected" ]; then emit "CHECKSUM: MATCH"; else emit "CHECKSUM: MISMATCH — do not use this file"; fi
    emit "MODIFIED: $(stat -f '%Sm' "$path" 2>/dev/null)"
    emit "Rule 10 amendment check: confirm this timestamp is from THIS transfer."
    emit "----------------------------------------------------------------"
    if [ "$inline" = "yes" ]; then
      cat "$path" >> "$OUT"
    else
      emit "(Contents not inlined — 1,993 lines. Build Agent reads this file"
      emit " directly from disk when verbatim verification is required.)"
    fi
    emit ""
  else
    MISSING=$((MISSING+1))
    MISSING_LIST="${MISSING_LIST}\n    ${path}"
    emit "MISSING — NOT FOUND at ${path}"
    emit ""
  fi
}

stage_file "$RECOVERY" "AGENT_REFERENCE_v37_rules_recovery_content.md" "$RECOVERY_SHA_EXPECTED" "yes"
stage_file "$PARALLEL" "AGENT_REFERENCE_v3.5.md (parallel lineage, never committed)" "$PARALLEL_SHA_EXPECTED" "no"

TOTAL=$((FOUND+MISSING))
emit "================================================================"
emit "END OF CONTEXT PACKAGE — ${FOUND} of ${TOTAL} files found, ${MISSING} missing"
emit "================================================================"

cat "$OUT" | pbcopy
cp "$OUT" /tmp/sovereign_session109_context.txt
rm -f "$OUT"

# ---- Terminal report --------------------------------------------------------
echo
echo "SOVEREIGN — Session 109 context gather"
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
  echo "  Saved to: /tmp/sovereign_session109_context.txt"
fi
echo "------------------------------------------------------------"
echo "  branch : $(git rev-parse --abbrev-ref HEAD)"
echo "  HEAD   : $(git rev-parse --short HEAD)"
echo "  uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
echo "------------------------------------------------------------"
echo
echo "  Next: Terminal 1 — launch Build Agent, paste this clipboard first,"
echo "  then paste the Session 109 opening prompt."
echo
