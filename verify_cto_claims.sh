#!/bin/bash
# ==============================================================================
# SOVEREIGN Platform — CTO Claim Verification
# verify_cto_claims.sh
#
# TERMINAL 2 ONLY. Strictly read-only: no edits, no staging, no commits.
#
# Purpose: confirm the load-bearing claims in the CTO demonstration materials
# against the real codebase, before they are said out loud in a room.
#
# Each section states the CLAIM being tested and reports CONFIRMED /
# NOT CONFIRMED / REVIEW. Nothing here is self-certifying — REVIEW means a
# human reads the evidence and decides.
#
# DO NOT FIX ANYTHING THIS SCRIPT FINDS. Report it. A claim that fails here
# is a sentence to remove from a document, not a file to quietly change.
# ==============================================================================

set -u

cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found at ~/Developer/sovereign-platform"; exit 1; }

PASS=0; FAIL=0; REVIEW=0
ok()     { echo "  CONFIRMED   : $1"; PASS=$((PASS+1)); }
no()     { echo "  NOT CONFIRMED: $1"; FAIL=$((FAIL+1)); }
review() { echo "  REVIEW      : $1"; REVIEW=$((REVIEW+1)); }
hdr()    { echo; echo "============================================================"; echo "$1"; echo "============================================================"; }

echo
echo "SOVEREIGN — CTO claim verification (read-only)"
echo "Repo: $(pwd)"
echo "HEAD: $(git rev-parse --short HEAD 2>/dev/null)"
echo "Date: $(date '+%Y-%m-%d %H:%M')"

# ---------------------------------------------------------------------------
hdr "1. CLAIM: 'A second inference provider is already built and tested.'
   Source: Governing the Loop, takeaway 1 and the Sovereignty section
           GD-42 Rev C §4.2"
# ---------------------------------------------------------------------------
BASE="sovereign-api-client/src"
for f in providers/anthropic-provider.ts providers/ollama-provider.ts providers/provider-registry.ts routing.ts model-registry.ts inference-logger.ts ollama-endpoint.ts; do
  if [ -f "$BASE/$f" ]; then
    ok "$BASE/$f ($(wc -l < "$BASE/$f" | tr -d ' ') lines)"
  else
    no "$BASE/$f — ABSENT"
  fi
done

echo
echo "  -- Test coverage for those files --"
TESTCOUNT=$(find sovereign-api-client -path ./node_modules -prune -o \( -name "*ollama*test*" -o -name "*routing*test*" -o -name "*model-registry*test*" -o -name "*provider*test*" \) -print 2>/dev/null | wc -l | tr -d ' ')
if [ "$TESTCOUNT" -gt 0 ]; then
  ok "$TESTCOUNT matching test file(s) found:"
  find sovereign-api-client -path ./node_modules -prune -o \( -name "*ollama*test*" -o -name "*routing*test*" -o -name "*model-registry*test*" -o -name "*provider*test*" \) -print 2>/dev/null | sed 's/^/      /'
else
  no "no test files found for provider/routing/model-registry — 'and tested' is unsupported"
fi

# ---------------------------------------------------------------------------
hdr "2. CLAIM: 'Routing selects the local provider only for a classification our
   operating boundary never produces' — an enforced condition, readable in code.
   Source: Governing the Loop, Sovereignty section · GD-42 Rev C §2.4"
# ---------------------------------------------------------------------------
if [ -f "$BASE/routing.ts" ]; then
  echo "  -- Real contents of the routing decision --"
  grep -n "CUI\|data_classification\|selectProvider\|ollama" "$BASE/routing.ts" 2>/dev/null | head -20 | sed 's/^/      /'
  echo
  if grep -q "CUI" "$BASE/routing.ts" 2>/dev/null; then
    ok "routing.ts gates on a CUI classification check"
  else
    no "routing.ts does not reference CUI — the stated gate condition is not there"
  fi
  review "read the lines above yourself — the claim is that an evaluator could read them"
else
  no "routing.ts absent — the enforced-condition claim cannot be made"
fi

echo
echo "  -- Is the second provider enabled in any committed configuration? --"
ENABLED_HITS=$(grep -rn "VITE_OLLAMA_ENABLED" --include="*.ts" --include="*.tsx" --include="*.env*" --include="*.json" --include="*.yaml" . 2>/dev/null | grep -v node_modules | grep -vi "test\|spec")
if [ -n "$ENABLED_HITS" ]; then
  echo "$ENABLED_HITS" | sed 's/^/      /'
  if echo "$ENABLED_HITS" | grep -qi "=true\|: *true\|'true'\|\"true\""; then
    no "a committed reference appears to set the flag TRUE — read the lines above"
  else
    ok "flag referenced but not set true in committed configuration"
  fi
else
  ok "no committed VITE_OLLAMA_ENABLED assignment found"
fi

# ---------------------------------------------------------------------------
hdr "3. CLAIM: 'Model weights are verified at load; a mismatch throws, blocks
   inference, and raises a priority-one alert.'
   Source: Governing the Loop, Sovereignty section · GD-42 Rev C §2.5"
# ---------------------------------------------------------------------------
if [ -f "$BASE/model-registry.ts" ]; then
  grep -q "sha256\|SHA256\|sha_256" "$BASE/model-registry.ts" 2>/dev/null \
    && ok "model-registry.ts references a SHA-256 field or check" \
    || no "model-registry.ts has no SHA-256 reference"
  grep -q "ModelIntegrityError" "$BASE/model-registry.ts" 2>/dev/null \
    && ok "ModelIntegrityError is defined or thrown" \
    || no "ModelIntegrityError not found — 'a mismatch throws' is unsupported"
else
  no "model-registry.ts absent"
fi

echo
echo "  -- MODEL_HASH_MISMATCH and its severity --"
grep -rn "MODEL_HASH_MISMATCH" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | head -10 | sed 's/^/      /'
grep -rq "MODEL_HASH_MISMATCH" --include="*.ts" . 2>/dev/null \
  && ok "MODEL_HASH_MISMATCH event type present in code" \
  || no "MODEL_HASH_MISMATCH not found in code"
echo "  (P1 severity is asserted in the spec — confirm from the dispatcher's own"
echo "   routing table, not from the event name. See section 4.)"

# ---------------------------------------------------------------------------
hdr "4. CLAIM: 'Every inference call, provider fallback, and integrity failure
   lands in the same hash-chained log as every other decision.'
   Source: Governing the Loop, Cognitive Loop section"
# ---------------------------------------------------------------------------
for evt in INFERENCE_CALL INFERENCE_PROVIDER_FALLBACK MODEL_HASH_MISMATCH; do
  HIT=$(grep -rln "$evt" --include="*.ts" . 2>/dev/null | grep -v node_modules | head -3)
  if [ -n "$HIT" ]; then
    ok "$evt present"
    echo "$HIT" | sed 's/^/         /'
  else
    no "$evt not found anywhere in TypeScript source"
  fi
done

echo
echo "  -- Are they in the shell contract's event type union? --"
find . -name "shell-contract.ts" -not -path "*/node_modules/*" 2>/dev/null | while read -r f; do
  C=$(grep -c "INFERENCE_CALL\|INFERENCE_PROVIDER_FALLBACK\|MODEL_HASH_MISMATCH" "$f" 2>/dev/null)
  echo "      $f — $C of 3 inference event references"
done
echo "  -- And propagated to shared types (Constraint #11)? --"
grep -c "INFERENCE_CALL" sovereign-data/src/shared-types.ts 2>/dev/null | sed 's/^/      shared-types.ts INFERENCE_CALL refs: /'

echo
echo "  -- P1 severity routing, from the dispatcher itself --"
grep -rn "P1\|priority.*1\|CRITICAL" --include="*.py" sovereign-security 2>/dev/null | grep -i "dispatch\|alert\|severity" | head -8 | sed 's/^/      /'
review "confirm MODEL_HASH_MISMATCH is actually in the P1 path, not merely named as P1 in the spec"

# ---------------------------------------------------------------------------
hdr "5. CLAIM: 'No AI model sits in ARIA's decision path at runtime — rule
   evaluation is deterministic logic, verifiable by code inspection.'
   Source: Governing the Loop, Cognitive Loop section — THE STRONGEST CLAIM
           IN THE DOCUMENT. If any single check matters, it is this one."
# ---------------------------------------------------------------------------
if [ -d "module-aria" ]; then
  echo "  -- Does module-aria import the API client at all? --"
  ARIA_CLIENT=$(grep -rn "@sovereign/api-client\|sovereign-api-client\|createSovereignClient" --include="*.ts" --include="*.tsx" module-aria/src 2>/dev/null | grep -v node_modules)
  if [ -z "$ARIA_CLIENT" ]; then
    ok "module-aria/src contains no API-client import — no inference path present"
  else
    echo "$ARIA_CLIENT" | sed 's/^/      /'
    review "API-client references found in module-aria — read each one. A reference in a"
    echo "                display, explanation, or test path is not the same as a model in the"
    echo "                DECISION path, but the claim must be narrowed to match what is true."
  fi

  echo
  echo "  -- Any direct provider or inference references in ARIA? --"
  ARIA_PROV=$(grep -rni "anthropic\|ollama\|inference\|completion\|prompt" --include="*.ts" --include="*.tsx" module-aria/src 2>/dev/null | grep -v node_modules | grep -vi "test\|spec\|\.md")
  if [ -z "$ARIA_PROV" ]; then
    ok "no provider or inference references in module-aria/src"
  else
    echo "$ARIA_PROV" | head -15 | sed 's/^/      /'
    review "read these before repeating the AI-absence attestation"
  fi

  echo
  echo "  -- Where the deterministic rule evaluation actually lives --"
  find module-aria/src -name "*rule*" -o -name "*evaluat*" -o -name "*arc*" -o -name "*tracer*" -o -name "*clear*" 2>/dev/null | grep -v node_modules | head -12 | sed 's/^/      /'
else
  no "module-aria directory not found — check the real module layout"
fi

# ---------------------------------------------------------------------------
hdr "6. OPEN QUESTION: where is the SOVEREIGN-LLM-001 Decision Framework, and
   what are docs 06 and 07?
   Source: GD-42 Rev C §4.1 · Integration Brief v1.60 and Backlog v5 both cite
           'docs/06 §3.2' and 'docs/07 §8.1', which cannot be located."
# ---------------------------------------------------------------------------
echo "  -- Everything in docs/ --"
ls -1 docs/ 2>/dev/null | sed 's/^/      /' || echo "      no docs/ directory"
echo
echo "  -- Anything named 06_* or 07_*, repo-wide --"
find . -path ./node_modules -prune -o -name "0[67]_*" -print 2>/dev/null | sed 's/^/      /'
echo
echo "  -- SOVEREIGN-LLM-001 by identifier, repo and Downloads --"
grep -rl "SOVEREIGN-LLM-001" --include="*.md" . 2>/dev/null | grep -v node_modules | sed 's/^/      repo: /'
grep -rl "SOVEREIGN-LLM-001" "$HOME/Downloads" 2>/dev/null | sed 's/^/      dl:   /'
echo
echo "  -- Every file that has EVER existed in docs/, including deleted --"
git log --all --name-only --format="" -- "docs/*" 2>/dev/null | sort -u | head -40 | sed 's/^/      /'
echo
echo "  -- Who is propagating the docs/06 and docs/07 citation? --"
grep -rn "docs/0[67]" --include="*.md" . 2>/dev/null | grep -v node_modules | head -10 | sed 's/^/      /'
review "if 06 and 07 never existed, the Integration Brief and Backlog are citing phantom sources"

# ---------------------------------------------------------------------------
hdr "7. CLAIM: 'Cost tracking covers fourteen of nineteen live call sites, and
   the gap is disclosed.'
   Source: Governing the Loop, summary point 3"
# ---------------------------------------------------------------------------
echo "  -- Cost/telemetry instrumentation call sites --"
COSTSITES=$(grep -rln "recordCost\|costTelemetry\|trackCost\|TOKEN_USAGE\|cost_event" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
echo "      files referencing cost instrumentation: $COSTSITES"
review "the 14-of-19 figure comes from a Session 81 audit re-derived in August; if this"
echo "                number has drifted, the disclosed gap in the documents has drifted too"

# ---------------------------------------------------------------------------
hdr "SUMMARY"
# ---------------------------------------------------------------------------
echo "  CONFIRMED    : $PASS"
echo "  NOT CONFIRMED: $FAIL"
echo "  REVIEW       : $REVIEW"
echo
if [ "$FAIL" -gt 0 ]; then
  echo "  One or more claims are NOT CONFIRMED."
  echo "  The correct response is to remove or narrow the sentence in the document —"
  echo "  NOT to change code so the claim becomes true before a demonstration."
fi
echo
echo "  REVIEW items require a person to read the evidence printed above."
echo "  This script certifies nothing on its own."
echo "  (Rule 17: a check's existence is not evidence of its use — run it, and quote"
echo "   its real output wherever these claims are recorded.)"
echo
