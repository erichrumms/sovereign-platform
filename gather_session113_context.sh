#!/bin/bash
# SOVEREIGN — Session 113 Context Gather. TERMINAL 2 ONLY. Read-only.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
OUT="$(mktemp)"; FOUND=0; MISSING=0; ML=""
FILES=( "AGENT_REFERENCE.md" "CLAUDE.md" "DOCUMENT_MANIFEST.tsv" "PLACEMENT_LOG.tsv"
  "docs/40_Defect_Class_Register.md" ".sovereign_check_baseline"
  "SOVEREIGN_CTO_Demonstration_Script_20260811.md" )
emit() { printf '%s\n' "$1" >> "$OUT"; }
emit "================================================================"
emit "SOVEREIGN — SESSION 113 CONTEXT PACKAGE   $(date '+%Y-%m-%d %H:%M')"
emit "================================================================"
emit ""
emit "REPO STATE"
emit "  branch: $(git rev-parse --abbrev-ref HEAD)   HEAD: $(git rev-parse --short HEAD)"
emit "  uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "ENFORCEMENT — Tier 1 pre-commit is LIVE and BLOCKS on growing drift"
emit "  core.hooksPath: $(git config core.hooksPath)"
emit "  baselines: EMITTED_NOT_IN_CONTRACT=4  STALE_CONTRACT_HASH_IN_TOOLING=3"
emit "  Never raise a baseline to make a commit pass."
emit ""
emit "SHELL CONTRACT"
while IFS= read -r f; do emit "  $(shasum -a 256 "$f")"; done \
  < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "DEFECT 1 EVIDENCE — program counts across three surfaces"
emit "  Home Dashboard program source:"
grep -rn "PROGRAM\|programs" --include="*.ts" --include="*.tsx" sovereign-shell/src/PlatformHome.tsx 2>/dev/null | head -8 | sed 's/^/    /' >> "$OUT"
emit "  APEX portfolio source:"
grep -rln "portfolio\|Portfolio" --include="*.ts" --include="*.tsx" module-apex/src 2>/dev/null | head -6 | sed 's/^/    /' >> "$OUT"
emit "  Program dataset files:"
grep -rln "SYNTH-PRG\|P-100\|programs" --include="*.ts" sovereign-data/src module-apex/src module-cpmi/src 2>/dev/null | head -10 | sed 's/^/    /' >> "$OUT"
emit ""
emit "DEFECT 2 EVIDENCE — obligation status thresholds"
grep -rn "On track\|ON_TRACK\|obligation" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -i "status\|threshold\|track" | head -10 | sed 's/^/    /' >> "$OUT"
emit ""
emit "DEFECT 3 EVIDENCE — agentos ID formatting"
grep -n "agentos" module-vigil/src/approval-port.ts 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit ""
emit "DEFECT 4 EVIDENCE — operator display label"
grep -rn "Platform Developer\|Dev —\|Dev -" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -8 | sed 's/^/    /' >> "$OUT"
emit ""
emit "================================================================"
emit ""
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then FOUND=$((FOUND+1))
    emit "================================================================"
    emit "FILE: $f"
    emit "LINES: $(wc -l < "$f" | tr -d ' ')  SHA256: $(shasum -a 256 "$f" | awk '{print $1}')"
    emit "================================================================"
    cat "$f" >> "$OUT"; emit ""; emit ""
  else MISSING=$((MISSING+1)); ML="${ML}\n    $f"
    emit "################ MISSING: $f ################"; emit ""
  fi
done
T=$((FOUND+MISSING))
emit "END — ${FOUND} of ${T} files found, ${MISSING} missing"
cat "$OUT" | pbcopy; cp "$OUT" /tmp/sovereign_session113_context.txt; rm -f "$OUT"
echo; echo "SOVEREIGN — Session 113 gather"
echo "  ${FOUND} of ${T} files found. ${MISSING} missing."
[ "$MISSING" != "0" ] && { echo "  MISSING:"; printf "%b\n" "$ML"; echo "  DO NOT PASTE."; } \
  || echo "  Copied to clipboard.  /tmp/sovereign_session113_context.txt"
echo "  HEAD: $(git rev-parse --short HEAD)   uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
echo
