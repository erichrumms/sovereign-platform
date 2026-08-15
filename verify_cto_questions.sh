#!/bin/bash
# ==============================================================================
# SOVEREIGN — CTO Question Verification
# verify_cto_questions.sh
#
# TERMINAL 2 ONLY. Strictly read-only. No edits, no staging, no commits.
#
# Purpose: answer the checkable questions from the CTO review with real evidence
# from the codebase, so the Q&A preparation document is built on what is there
# rather than what we believe is there.
#
# DO NOT FIX WHAT THIS FINDS. An answer that does not hold up is a sentence to
# change in the briefing, not code to change before a demonstration.
# ==============================================================================

set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
hdr() { echo; echo "============================================================"; echo "$1"; echo "============================================================"; }
sub() { echo; echo "  -- $1 --"; }

echo
echo "SOVEREIGN — CTO question verification (read-only)"
echo "HEAD: $(git rev-parse --short HEAD)   $(date '+%Y-%m-%d %H:%M')"

# ---------------------------------------------------------------------------
hdr "Q3 — WHAT ENFORCES PERMISSIONS, AND WHERE"
sub "Identity provider and auth entry point"
grep -rn "SAML\|EAMS\|oidc\|OIDC\|authProvider\|useAuth" --include="*.ts" --include="*.tsx" sovereign-shell/src 2>/dev/null | grep -v node_modules | head -8
sub "Role definitions — what roles exist in code"
grep -rn "SovereignRole\|type Role\|ROLES *=" --include="*.ts" sovereign-shell/src sovereign-data/src 2>/dev/null | grep -v node_modules | head -8
sub "Where an access decision is actually made"
grep -rln "hasModuleAccess\|canAccess\|isAuthorized\|checkAccess\|roleAllows" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -10
sub "Is the check on render only, or on the action too?"
grep -rn "hasModuleAccess\|canAccess\|isAuthorized" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -12
echo "  READ THIS: if every hit is in a .tsx render path, permissions are enforced"
echo "  in the interface layer only. That is a materially different answer than"
echo "  enforcement at a service or data boundary. Report what is actually there."

# ---------------------------------------------------------------------------
hdr "Q2 / Q16 — IS THE PLATFORM THE MANDATORY PATH, OR THE APPROVED PATH?"
sub "Does any module import an AI provider directly, bypassing the shared client?"
grep -rn "anthropic\|Anthropic\|openai\|ollama" --include="*.ts" --include="*.tsx" module-*/src 2>/dev/null | grep -v node_modules | grep -vi "test\|spec\|comment\|//" | head -12
echo "  (Expected: nothing. Every hit here is a module reaching past the client.)"
sub "How many modules import the shared client"
grep -rl "@sovereign/api-client\|sovereign-api-client" --include="*.ts" --include="*.tsx" module-*/src 2>/dev/null | grep -v node_modules | wc -l | sed 's/^/  modules importing the client: /'
sub "Is the shell contract enforced at build time, run time, or by review?"
grep -rn "shell-contract" --include="*.json" --include="*.js" --include="*.ts" . 2>/dev/null | grep -v node_modules | grep -iE "test|lint|ci|verify|check" | head -8
echo "  READ THIS: if the contract is only a TypeScript type plus a hash check in"
echo "  a script, the honest answer is 'enforced at build and review time', not"
echo "  'enforced at run time'. Both are real. They are not the same claim."

# ---------------------------------------------------------------------------
hdr "Q4 — WHAT ACTUALLY REQUIRES HUMAN APPROVAL"
sub "Risk classification before agent execution"
grep -rn "risk_classification\|riskClass\|BLOCKED\|HIGH\|MEDIUM\|LOW" --include="*.ts" module-agentos/src 2>/dev/null | grep -v node_modules | head -10
sub "Are risk rules data, or hardcoded?"
find module-agentos/src -name "*risk*" -o -name "*classif*" -o -name "*catalog*" 2>/dev/null | grep -v node_modules | head -8
sub "Where the approval gate lives"
grep -rln "approval\|Approval" --include="*.ts" --include="*.tsx" module-vigil/src 2>/dev/null | grep -v node_modules | head -8

# ---------------------------------------------------------------------------
hdr "Q8 / Q9 — THE AUDIT RECORD: MECHANISM AND CONTENT"
sub "Hash chaining — the actual implementation"
grep -n "sha256\|hash\|prev_hash\|chain" sovereign-security/sovereign_logger.py 2>/dev/null | head -12
sub "Storage: file, database, or service?"
grep -n "open(\|jsonl\|append\|write" sovereign-security/sovereign_logger.py 2>/dev/null | head -10
sub "What fields an agent step actually carries"
grep -n "agent_id\|agent_class\|workflow_step_id\|model\|prompt\|token\|timestamp\|user" sovereign-security/sovereign_logger.py 2>/dev/null | head -20
sub "Does the platform fail closed if the log cannot be written?"
grep -n "except\|raise\|try:" sovereign-security/sovereign_logger.py 2>/dev/null | head -12
echo "  READ THIS: if a write failure is swallowed, the honest answer to 'does"
echo "  processing fail closed' is NO. Say so plainly — a CTO will respect that"
echo "  more than a claim that does not survive the follow-up question."

# ---------------------------------------------------------------------------
hdr "Q10 — MODEL VERSIONS AND PROVIDER CHANGE"
sub "Is a model version pinned anywhere?"
grep -rn "model_id\|modelId\|model:" --include="*.ts" sovereign-api-client/src 2>/dev/null | grep -v node_modules | head -10
sub "Model registry fields"
grep -n "interface ModelRegistryEntry" -A 14 sovereign-api-client/src/model-registry.ts 2>/dev/null

# ---------------------------------------------------------------------------
hdr "Q13 — HOW 'UNCLASSIFIED ONLY' IS ENFORCED"
sub "Where classification is evaluated"
grep -rn "data_classification\|DataClassification\|ClassificationNotAuthorized" --include="*.ts" . 2>/dev/null | grep -v node_modules | grep -v test | head -12
echo "  READ THIS: classification is supplied by the CALLER. Confirm whether"
echo "  anything inspects content, or whether the platform trusts the label."
echo "  If it trusts the label, this is a routing control, not a data-loss control."

# ---------------------------------------------------------------------------
hdr "Q21 — FAILURE BEHAVIOUR"
sub "Fallback tiers and retry"
grep -rn "fallback\|retry\|catch\|timeout" --include="*.ts" sovereign-api-client/src 2>/dev/null | grep -v node_modules | head -12
sub "Failure categories the cost tracker distinguishes"
grep -rn "auth\|rate_limit\|timeout\|server_error\|failure_category" --include="*.ts" sovereign-api-client/src 2>/dev/null | grep -v node_modules | head -10

# ---------------------------------------------------------------------------
hdr "Q22 — COST: OBSERVED OR GOVERNED?"
sub "Is there any budget, cap, or limit — or only measurement?"
grep -rn "budget\|limit\|cap\|threshold\|quota" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -i "cost\|token\|spend" | head -10
echo "  (If nothing returns: cost is observed, not governed. That is the answer.)"

# ---------------------------------------------------------------------------
hdr "Q23 — PROMPT INJECTION AND UNTRUSTED CONTENT"
sub "Any sanitisation, escaping, or untrusted-content handling?"
grep -rn "sanitiz\|sanitis\|escape\|untrusted\|injection" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | head -10
echo "  (If nothing returns: this is unaddressed. Name it as a gap; do not"
echo "  improvise an answer in the room.)"

# ---------------------------------------------------------------------------
hdr "Q11 — WHAT 'BUILT' MEANS"
sub "Test counts by workspace"
grep -c "test:" package.json 2>/dev/null | sed 's/^/  test scripts declared: /'
sub "CI configuration present?"
ls -1 .github/workflows/ 2>/dev/null || echo "  no .github/workflows — no CI pipeline"
sub "Error handling density in module source"
grep -rc "catch\|except" --include="*.ts" --include="*.tsx" module-*/src 2>/dev/null | grep -v ":0$" | wc -l | sed 's/^/  module files with error handling: /'

# ---------------------------------------------------------------------------
hdr "Q25 — WHO GOVERNS THE PLATFORM ITSELF"
sub "Are platform-administrator actions logged like everything else?"
grep -rn "PLATFORM_ADMIN\|SYSTEM_ADMIN" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -i "log\|audit\|event" | head -8
echo "  (If nothing returns: admin actions may not be audited. That is one of the"
echo "  sharpest questions in the review. Get the real answer.)"

echo
echo "============================================================"
echo "HOW TO USE THIS OUTPUT"
echo "============================================================"
echo "  Every section above answers a numbered question from the CTO review."
echo "  Where a section returns nothing, that IS the answer — the capability is"
echo "  not there, and the briefing should say so rather than imply otherwise."
echo "  Change the claim, not the code."
echo
