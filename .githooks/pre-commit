#!/bin/bash
# SOVEREIGN — Tier 1 Cross-Artifact Checks (v2)
# Runs in .git/hooks/pre-commit. Exit 1 BLOCKS the commit.
# Fails only when drift GROWS above the recorded baseline.
# Override: git commit --no-verify — and record why in the handoff.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
BASE=".sovereign_check_baseline"; FAILED=0
prior() { grep "^$1=" "$BASE" 2>/dev/null | tail -1 | cut -d= -f2 | tr -dc '0-9'; }
judge() {
  local n="$1" cur="$2" was; was=$(prior "$n")
  if [ -z "$was" ]; then echo "  UNSET: $n = $cur  (add to $BASE)"; return; fi
  if [ "$cur" -gt "$was" ]; then echo "  BLOCKED: $n grew $was -> $cur"; FAILED=1
  elif [ "$cur" -lt "$was" ]; then echo "  IMPROVED: $n $was -> $cur (lower baseline)"
  else echo "  ok: $n at baseline ($cur)"; fi
}
echo "SOVEREIGN Tier 1 cross-artifact checks (v2)"

CONTRACT=$(ls sovereign-shell/shell-contract.ts shell-contract.ts 2>/dev/null | head -1)
SHARED="sovereign-data/src/shared-types.ts"

# Extract the full SovereignEventType union: from the declaration to the first
# line that is not a union member or comment.
extract_union() {
  awk '/type SovereignEventType/{f=1} f{print; if(/;\s*$/ && !/=/) exit}' "$1" \
    | grep -oE '"[A-Z][A-Z0-9_]+"' | tr -d '"' | sort -u
}

# 1. Contract event types missing from shared types (Constraint #11)
if [ -n "$CONTRACT" ] && [ -f "$SHARED" ]; then
  extract_union "$CONTRACT" > /tmp/_ct.txt
  grep -oE '"[A-Z][A-Z0-9_]+"' "$SHARED" | tr -d '"' | sort -u > /tmp/_sh.txt
  CTN=$(wc -l < /tmp/_ct.txt | tr -d ' ')
  MISSING=$(comm -23 /tmp/_ct.txt /tmp/_sh.txt | wc -l | tr -d ' ')
  echo "  (contract union parsed: $CTN members — sanity-check this number)"
  judge EVENTTYPE_NOT_PROPAGATED "$MISSING"
  [ "$MISSING" -gt 0 ] && comm -23 /tmp/_ct.txt /tmp/_sh.txt | head -10 | sed 's/^/       missing: /'
fi

# 2. Event types emitted in code but absent from the contract union
if [ -s /tmp/_ct.txt ]; then
  grep -rhoE 'event_type: *"[A-Z][A-Z0-9_]+"' --include="*.ts" --include="*.tsx" . 2>/dev/null \
    | grep -v node_modules | grep -oE '"[A-Z][A-Z0-9_]+"' | tr -d '"' | sort -u > /tmp/_em.txt
  ORPHAN=$(comm -23 /tmp/_em.txt /tmp/_ct.txt | wc -l | tr -d ' ')
  judge EMITTED_NOT_IN_CONTRACT "$ORPHAN"
  [ "$ORPHAN" -gt 0 ] && comm -23 /tmp/_em.txt /tmp/_ct.txt | head -10 | sed 's/^/       orphan: /'
fi

# 3. Logger event types with no dispatcher routing decision.
#    Scoped to the logger's declared event-type collection only.
LOG="sovereign-security/sovereign_logger.py"; ALERTS="sovereign-security/sovereign_alerts.py"
if [ -f "$LOG" ] && [ -f "$ALERTS" ]; then
  awk '/EVENT_TYPES|VALID_EVENT/{f=1} f{print} f&&/\}/{exit}' "$LOG" \
    | grep -oE '"[A-Z][A-Z0-9_]+"' | tr -d '"' | sort -u > /tmp/_lg.txt
  grep -oE '"[A-Z][A-Z0-9_]+"' "$ALERTS" | tr -d '"' | sort -u > /tmp/_al.txt
  LGN=$(wc -l < /tmp/_lg.txt | tr -d ' ')
  UNROUTED=$(comm -23 /tmp/_lg.txt /tmp/_al.txt | wc -l | tr -d ' ')
  echo "  (logger event types parsed: $LGN — sanity-check this number)"
  judge LOGGER_EVENTS_UNROUTED "$UNROUTED"
fi

# 4. Shell-contract hash literals in tooling that no longer match the file
if [ -n "$CONTRACT" ]; then
  REAL=$(shasum -a 256 "$CONTRACT" | awk '{print $1}')
  # Only hashes on lines that reference the shell contract. A gather script
  # recording an expected checksum for a DIFFERENT file is Rule 10 discipline,
  # not drift. Narrowed Session 112 after a true block on a false positive.
  # A hash assigned to an EXPECTED_* variable, or labelled as expected, is a
  # frozen expectation. It is drift the moment its target moves. Gather scripts
  # recording an input checksum inline are Rule 10 discipline and are excluded.
  # Widened Session 112 after the narrowed form missed three dead expectations.
  STALE=$(grep -hE '^[[:space:]]*(EXPECTED|KNOWN)[A-Z_]*=|[Ee]xpected hash' *.sh 2>/dev/null \
    | grep -ohE '\b[a-f0-9]{64}\b' | sort -u | grep -vc "^${REAL}$")
  STALE=$(printf '%s' "$STALE" | tr -dc '0-9'); STALE=${STALE:-0}
  echo "  (frozen EXPECTED_* hashes that are not the live contract hash:)"
  grep -nE '^[[:space:]]*(EXPECTED|KNOWN)[A-Z_]*=|[Ee]xpected hash' *.sh 2>/dev/null \
    | grep -E '\b[a-f0-9]{64}\b' | grep -v "$REAL" | sed 's/^/       /' | cut -c1-120
  judge STALE_CONTRACT_HASH_IN_TOOLING "$STALE"
fi

echo
if [ "$FAILED" -eq 1 ]; then
  echo "COMMIT BLOCKED — cross-artifact drift increased."
  exit 1
fi
echo "Tier 1 clear."
exit 0
