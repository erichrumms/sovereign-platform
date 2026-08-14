#!/bin/bash
# SOVEREIGN — Session 112 Context Gather. TERMINAL 2 ONLY. Read-only.
# Convention: AGENT_REFERENCE.md § Context Gather Script.
# Write to repo root, commit, push, run here, paste clipboard into Terminal 1,
# then paste the opening prompt.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
OUT="$(mktemp)"; FOUND=0; MISSING=0; ML=""
REC="AGENT_REFERENCE_v310_lessons_recovery.md"
REC_SHA="63f557147aafacbfd14579f936413618c082aa94947ae958e2e6c282b4cb9cd9"
FILES=( "AGENT_REFERENCE.md" "CLAUDE.md" "DOCUMENT_MANIFEST.tsv" "PLACEMENT_LOG.tsv"
  "SOVEREIGN_Session111_Handoff.md" "SBOM_Session111_Update.md"
  "docs/40_Defect_Class_Register.md" "$REC"
  ".sovereign_check_baseline" ".githooks/pre-commit" ".githooks/commit-msg" )
emit() { printf '%s\n' "$1" >> "$OUT"; }
emit "================================================================"
emit "SOVEREIGN PLATFORM — SESSION 112 CONTEXT PACKAGE"
emit "Generated: $(date '+%Y-%m-%d %H:%M')"
emit "================================================================"
emit ""
emit "REPO STATE"
emit "  branch : $(git rev-parse --abbrev-ref HEAD)"
emit "  HEAD   : $(git rev-parse --short HEAD)  ($(git rev-parse HEAD))"
emit "  uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "ENFORCEMENT LAYER — live, verify before relying on it"
emit "  core.hooksPath: $(git config core.hooksPath)"
emit "  (must be set once per clone — the directory is versioned, the pointer is not)"
emit "  Tier 1 pre-commit BLOCKS when cross-artifact drift grows above baseline."
emit "  Active baselines: EMITTED_NOT_IN_CONTRACT=4  STALE_CONTRACT_HASH_IN_TOOLING=9"
emit "  Parked (parser unproven, do not baseline): EVENTTYPE_NOT_PROPAGATED, LOGGER_EVENTS_UNROUTED"
emit ""
emit "SHELL CONTRACT — Constraint #11 check"
while IFS= read -r f; do emit "  $(shasum -a 256 "$f")"; done \
  < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "TARGET: AGENT_REFERENCE.md $(wc -l < AGENT_REFERENCE.md | tr -d ' ') lines"
emit "  sha256: $(shasum -a 256 AGENT_REFERENCE.md | awk '{print $1}')"
emit "  expected at open: 2,151 lines, d11bcf90911c2705496ab850f52345dcb79bf925c31a18e0e2e0ba8712f28117 (v3.9)"
emit ""
emit "LESSON NUMBERING — for the D2 import"
emit "  present: $(grep -oE '^#+ *Lesson [0-9]+' AGENT_REFERENCE.md | grep -oE '[0-9]+' | sort -n | tr '\n' ' ')"
emit ""
emit "SBOM ARTIFACTS ON DISK — evidence for D3"
for f in SBOM*.md; do [ -e "$f" ] || continue
  emit "  ${f} | $(grep -m1 -oE 'v1\.[0-9]+' "$f" 2>/dev/null)"; done
emit ""
emit "================================================================"
emit ""
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then FOUND=$((FOUND+1))
    emit "================================================================"
    emit "FILE: $f"
    emit "LINES: $(wc -l < "$f" | tr -d ' ')  SHA256: $(shasum -a 256 "$f" | awk '{print $1}')"
    [ "$f" = "$REC" ] && emit "EXPECTED SHA: $REC_SHA"
    emit "================================================================"
    cat "$f" >> "$OUT"; emit ""; emit ""
  else MISSING=$((MISSING+1)); ML="${ML}\n    $f"
    emit "################ MISSING: $f ################"; emit ""
  fi
done
T=$((FOUND+MISSING))
emit "================================================================"
emit "END — ${FOUND} of ${T} files found, ${MISSING} missing"
emit "================================================================"
cat "$OUT" | pbcopy; cp "$OUT" /tmp/sovereign_session112_context.txt; rm -f "$OUT"
echo; echo "SOVEREIGN — Session 112 gather"
echo "------------------------------------------------------------"
echo "  ${FOUND} of ${T} files found. ${MISSING} missing."
[ "$MISSING" != "0" ] && { echo "  MISSING:"; printf "%b\n" "$ML"; echo "  DO NOT PASTE."; } \
  || echo "  Copied to clipboard. Saved: /tmp/sovereign_session112_context.txt"
echo "------------------------------------------------------------"
echo "  HEAD: $(git rev-parse --short HEAD)   uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
echo "  PRECONDITION: AGENT_REFERENCE.md v3.9 copied to iCloud root AND"
echo "  re-uploaded to project knowledge. Fifth consecutive session."
echo
