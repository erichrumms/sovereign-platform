#!/bin/bash
# SOVEREIGN Platform — Session 24 Context Gather Script
# Gathers all files required for Session 24 context
# Filenames verified against SBOM_Registry_v1.24_MERGED.md §4 New Components
# Run from monorepo root: ~/Developer/sovereign-platform/

REPO="$HOME/Developer/sovereign-platform"
OUTPUT=""
FOUND=0
MISSING=0
TOTAL=0

gather() {
  local path="$REPO/$1"
  local label="$2"
  TOTAL=$((TOTAL + 1))
  if [ -f "$path" ]; then
    OUTPUT="$OUTPUT\n\n========================================\nFILE: $1\n========================================\n"
    OUTPUT="$OUTPUT$(cat "$path")"
    FOUND=$((FOUND + 1))
  else
    OUTPUT="$OUTPUT\n\n========================================\nFILE: $1 — MISSING\n========================================\n"
    echo "MISSING: $1 ($label)"
    MISSING=$((MISSING + 1))
  fi
}

# --- Governance documents ---
gather "SOVEREIGN_Platform_Integration_Brief_v1_35.md"    "Integration Brief v1.35"
gather "SOVEREIGN_Agent_to_Agent_Briefing.md"             "Agent-to-Agent Briefing"
gather "Agent_Identity_Standard.md"                       "Agent Identity Standard (44 agents)"
gather "AGENT_REFERENCE.md"                               "Agent Reference"

# --- Shell contract ---
gather "sovereign-shell/shell-contract.ts"                "Shell contract v1.15"

# --- Prior session handoff ---
gather "SOVEREIGN_Session23_Handoff.md"                   "Session 23 handoff (retry complete)"

# --- Architecture specs ---
gather "docs/14_HumanReviewerStandard.md"                 "Human Reviewer Standard"
gather "docs/16_ARIA_Suite_Architecture.md"               "ARIA Suite Architecture (amended §4/§7)"

# --- ARIA Suite source files (Session 23 new components — from SBOM §4) ---
gather "module-aria/src/AriaApp.tsx"                      "AriaApp — CLEAR live, TRACER scaffold"
gather "module-aria/src/clear-types.ts"                   "CLEAR domain types"
gather "module-aria/src/clear-engine.ts"                  "CLEAR rule engine (deterministic)"
gather "module-aria/src/clear-ui.tsx"                     "CLEAR UI primitives"
gather "module-aria/src/useAriaCertifications.ts"         "ctx.aria hook"
gather "module-aria/src/ClearDashboard.tsx"               "Compliance Dashboard"
gather "module-aria/src/ClearCertificationQueue.tsx"      "Certification Queue"
gather "module-aria/src/ClearPanel.tsx"                   "CLEAR panel shell"
gather "module-aria/src/index.ts"                         "ARIA module contract"
gather "module-aria/package.json"                         "ARIA package"

# --- COUNSEL source (TRACER integration target) ---
gather "module-counsel/src/CounselApp.tsx"                "CounselApp — TRACER Decision Record integration"

# --- SCRIBE source (TRACER document lineage integration target) ---
gather "module-scribe/src/ScribeApp.tsx"                  "ScribeApp — TRACER document lineage"

# --- Python logger (TRACER event types) ---
gather "sovereign-security/sovereign_logger.py"           "Python logger — APPROVED_EVENT_TYPES"

# --- Copy to clipboard ---
echo -e "$OUTPUT" | pbcopy

echo ""
echo "========================================"
echo "Session 24 context gather complete"
echo "$FOUND of $TOTAL files found. $MISSING missing."
echo "Clipboard ready — paste into Claude Code."
echo "========================================"

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "WARNING: $MISSING file(s) missing. Check paths before proceeding."
fi
