#!/bin/bash
# SOVEREIGN — Session 115 Context Gather. TERMINAL 2 ONLY. Read-only.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
OUT="$(mktemp)"; FOUND=0; MISSING=0; ML=""; DL="$HOME/Downloads"
emit() { printf '%s\n' "$1" >> "$OUT"; }

emit "================================================================"
emit "SOVEREIGN — SESSION 115 CONTEXT PACKAGE   $(date '+%Y-%m-%d %H:%M')"
emit "================================================================"
emit ""
emit "REPO STATE"
emit "  branch: $(git rev-parse --abbrev-ref HEAD)   HEAD: $(git rev-parse --short HEAD)"
emit "  uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
emit ""
emit "ENFORCEMENT — Tier 1 pre-commit is LIVE and BLOCKS on growing drift"
emit "  core.hooksPath: $(git config core.hooksPath)"
emit "  baselines: EMITTED_NOT_IN_CONTRACT=4  STALE_CONTRACT_HASH_IN_TOOLING=3"
emit ""
emit "SHELL CONTRACT"
while IFS= read -r f; do emit "  $(shasum -a 256 "$f")"; done \
  < <(find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null)
emit ""
emit "EXISTING FILENAME CONVENTIONS — for the D1 naming reconciliation"
emit "  Integration Brief on disk:"
ls -1 SOVEREIGN_Platform_Integration_Brief_v*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit "  Backlog on disk:"
ls -1 SOVEREIGN_Remaining_Build_Backlog_v*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit "  Strategic Plan on disk:"
ls -1 SOVEREIGN_Strategic_Plan_CTO_Demo_v*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit "  CTO Framework on disk:"
ls -1 SOVEREIGN_CTO_Framework_Applied*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit "  GD Registry on disk:"
ls -1 SOVEREIGN_GD_Registry*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit "  SBOM registries on disk:"
ls -1 SBOM_Registry*.md 2>/dev/null | sed 's/^/    /' >> "$OUT"
emit ""
emit "STALE MANIFEST — report only, do not delete"
ls -la DOCUMENT_MANIFEST_v4.tsv 2>/dev/null | sed 's/^/    /' >> "$OUT" || emit "    DOCUMENT_MANIFEST_v4.tsv not in repo (may be Downloads-only)"
emit ""
emit "================================================================"
emit "STAGED FILES IN ~/Downloads — nine, each with an expected SHA-256"
emit "================================================================"

check_staged() {
  local name="$1" want="$2"
  if [ -f "$DL/$name" ]; then
    FOUND=$((FOUND+1))
    local got; got="$(shasum -a 256 "$DL/$name" | awk '{print $1}')"
    emit "  $name"
    emit "    lines: $(wc -l < "$DL/$name" | tr -d ' ')  modified: $(stat -f '%Sm' "$DL/$name" 2>/dev/null)"
    emit "    sha : $got"
    emit "    want: $want"
    [ "$got" = "$want" ] && emit "    MATCH" || emit "    *** MISMATCH — do not place this file ***"
  else
    MISSING=$((MISSING+1)); ML="${ML}\n    $name"
    emit "  MISSING: $name"
  fi
}

check_staged "AGENT_REFERENCE.md"                          "2f6e0f097ce67499cddf1a1eacf9225fc77b10d3adc0a566864c6620f8f12d73"
check_staged "Agent_Identity_Standard.md"                  "aaa335cf51e830e58cf3d8a13346ae1518014817892e585e95e10dd830ddd176"
check_staged "DOCUMENT_MANIFEST.tsv"                       "c085263fbf5babf3ca3a1dff4821e7b945553a875278520f12078695e2e71363"
check_staged "SOVEREIGN_Platform_Integration_Brief_v1.61.md" "1e4ae22fd238755ab450b6bfe0f229e8f51380b13006643932bf55d543845504"
check_staged "SOVEREIGN_Remaining_Build_Backlog_v6.md"     "21793d3dbb7036a0c405ca1441464e4f7f14210dfe9dfabd57bd94b1e40b9519"
check_staged "SOVEREIGN_Strategic_Plan_CTO_Demo_v3.14.md"  "47f85f6db37aba62e6554b9e792f86367f897f03716f992274d8cc2a5951e405"
check_staged "GD-42_APPROVED_and_GD-40_Amendment.md"       "a921c4d86656f77da3226f5b33b301442ef0fea99b74eaf739cd24f12404965d"
check_staged "SOVEREIGN_CTO_Framework_Applied_v2.md"       "357c78aba5e0e06031a2b17df04df210ed6bd8a1bfdb7378fd54d31c79db38e8"
check_staged "SBOM_Registry_v1.83_MERGED.md"               "a566b664bde3f6ea74e6cc2d444e40067b4f53b5c351df28714354ecef9a0383"

emit ""
emit "Rule 10 amendment: confirm every modification time above is from THIS transfer."
emit ""
emit "================================================================"
for f in CLAUDE.md PLACEMENT_LOG.tsv docs/40_Defect_Class_Register.md; do
  if [ -f "$f" ]; then FOUND=$((FOUND+1))
    emit "FILE: $f  ($(wc -l < "$f" | tr -d ' ') lines, $(shasum -a 256 "$f" | awk '{print $1}'))"
    emit "================================================================"
    cat "$f" >> "$OUT"; emit ""
  else MISSING=$((MISSING+1)); ML="${ML}\n    $f"; emit "MISSING: $f"; fi
done
T=$((FOUND+MISSING))
emit "END — ${FOUND} of ${T} found, ${MISSING} missing"

cat "$OUT" | pbcopy; cp "$OUT" /tmp/sovereign_session115_context.txt; rm -f "$OUT"
echo; echo "SOVEREIGN — Session 115 gather"
echo "  ${FOUND} of ${T} found. ${MISSING} missing."
[ "$MISSING" != "0" ] && { echo "  MISSING:"; printf "%b\n" "$ML"; echo "  DO NOT PASTE."; } \
  || echo "  Copied to clipboard.  /tmp/sovereign_session115_context.txt"
echo "  HEAD: $(git rev-parse --short HEAD)  uncommitted: $(git status --porcelain | wc -l | tr -d ' ')"
echo "  Read every SHA line above. A MISMATCH means do not place that file."
echo
