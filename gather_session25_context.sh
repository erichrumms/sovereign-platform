#!/bin/bash
# SOVEREIGN Platform — Session 25 Context Gather Script
# Gathers all files required for Session 25 context (ARC core + CPMI-VRS certification)
# Filenames verified against SBOM_Registry_v1.25_MERGED.md §4 New Components
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
gather "SOVEREIGN_Platform_Integration_Brief_v1_37.md"    "Integration Brief v1.37"
gather "SOVEREIGN_Agent_to_Agent_Briefing.md"             "Agent-to-Agent Briefing"
gather "Agent_Identity_Standard.md"                       "Agent Identity Standard (44 agents)"
gather "AGENT_REFERENCE.md"                               "Agent Reference"

# --- Shell contract ---
gather "sovereign-shell/shell-contract.ts"                "Shell contract v1.15 (unchanged)"

# --- Prior session handoff ---
gather "SOVEREIGN_Session24_Handoff.md"                   "Session 24 handoff (TRACER complete)"

# --- Architecture specs ---
gather "docs/14_HumanReviewerStandard.md"                 "Human Reviewer Standard"
gather "docs/14_HumanReviewerStandard_Addendum_SupervisionEfficiency.md" "Supervision Efficiency addendum"
gather "docs/16_ARIA_Suite_Architecture.md"               "ARIA Suite Architecture (CLEAR/TRACER live)"

# --- ARIA Suite source files — CLEAR (live, Session 23) ---
gather "module-aria/src/clear-types.ts"                   "CLEAR domain types"
gather "module-aria/src/clear-engine.ts"                  "CLEAR rule engine (deterministic)"
gather "module-aria/src/clear-ui.tsx"                      "CLEAR UI primitives — reuse for ARC"
gather "module-aria/src/ClearPanel.tsx"                   "CLEAR panel shell — pattern for ARC panel"

# --- ARIA Suite source files — TRACER (live, Session 24) ---
gather "module-aria/src/tracer-types.ts"                  "TRACER domain types"
gather "module-aria/src/tracer-engine.ts"                 "TRACER chain assembly engine"
gather "module-aria/src/tracer-integration.ts"            "TRACER COUNSEL/SCRIBE integration"
gather "module-aria/src/TracerExplorer.tsx"                "Traceability Explorer panel"

# --- ARIA Suite app shell and contract ---
gather "module-aria/src/AriaApp.tsx"                      "AriaApp — routing, ARC scaffold to replace"
gather "module-aria/src/useAriaCertifications.ts"         "ctx.aria hook"
gather "module-aria/src/index.ts"                         "ARIA module contract — aria.rules-engine card"
gather "module-aria/package.json"                         "ARIA package"

# --- COUNSEL source (ARC adaptation decision routing target) ---
gather "module-counsel/src/CounselApp.tsx"                "CounselApp — ARC adaptation decision routing"

# --- NEXUS source (ARC action item routing target) ---
gather "module-nexus/src/NexusApp.tsx"                    "NexusApp — ARC action item routing"

# --- Python logger (ARC event types, if any) ---
gather "sovereign-security/sovereign_logger.py"           "Python logger — APPROVED_EVENT_TYPES (82, intentional divergence)"

# --- Copy to clipboard ---
echo -e "$OUTPUT" | pbcopy

echo ""
echo "========================================"
echo "Session 25 context gather complete"
echo "$FOUND of $TOTAL files found. $MISSING missing."
echo "Clipboard ready — paste into Claude Code."
echo "========================================"

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "WARNING: $MISSING file(s) missing. Check paths before proceeding."
fi
