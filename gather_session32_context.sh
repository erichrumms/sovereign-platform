#!/usr/bin/env bash
set -uo pipefail

OUT="/tmp/session32_context.md"
> "$OUT"

echo "SOVEREIGN Session 32 Full Cycle Context Gather" >> "$OUT"
echo "" >> "$OUT"

MISSING=0

add_file() {
  local path="$1"
  local label="$2"
  if [ -f "$path" ]; then
    echo "  OK $path"
    {
      echo "----------------------------------------------------------------"
      echo "FILE: $path"
      echo "PURPOSE: $label"
      echo "----------------------------------------------------------------"
      cat "$path"
      echo ""
    } >> "$OUT"
  else
    echo "  MISSING: $path  ($label)"
    MISSING=$((MISSING+1))
  fi
}

echo "Gathering Session 32 context files"
echo ""

add_file "SOVEREIGN_Platform_Integration_Brief_v1.42.md" "Current platform constants reference"
add_file "docs/18_PPBE_Workflow_Architecture.md" "PPBE build spec section 7.2"
add_file "docs/SOVEREIGN_Strategic_Plan_CTO_Demo_v1.md" "Current sequencing and status"
add_file "AGENT_REFERENCE.md" "Prompt authorship workflow"
add_file "Agent_Identity_Standard.md" "Canonical agent registry"
add_file "shell-contract.ts" "Frozen shell contract, verify SHA-256 matches v1.16"
add_file "SOVEREIGN_Session31_Handoff.md" "Exact shapes of what Session 31 built"

LOGGER=$(find . -iname "sovereign_logger.py" -not -path "./node_modules/*" 2>/dev/null | head -1)
if [ -n "${LOGGER:-}" ]; then
  add_file "$LOGGER" "Logger schema, 99 approved event types, PPBE Python-only"
else
  echo "  MISSING: sovereign_logger.py not found"
  MISSING=$((MISSING+1))
fi

for f in \
  "sovereign-data/src/entities/strategic-objective.ts" \
  "sovereign-data/src/entities/program-record.ts" \
  "sovereign-data/src/entities/budget-exhibit.ts" \
  "sovereign-data/src/entities/obligation-record.ts" \
  "sovereign-data/src/entities/evaluation-finding.ts" \
  "sovereign-data/src/entities/dependency-map.ts" \
  "module-flowpath/src/ppbe-artifacts.ts" \
  "module-nexus/src/ppbe-tasks.ts" \
  "module-vigil/src/ppbe-authorization.ts" \
  "module-apex/src/ppbe-ledger-monitor.ts" \
  "module-flowpath/src/ppbe-dependency-tracker.ts"
do
  add_file "$f" "Session 31 output, consumed by Session 32 agents"
done

SCRIBE_DRAFTER=$(find module-scribe -iname "*travel-drafter*" -o -iname "*time-drafter*" 2>/dev/null | head -1)
if [ -n "${SCRIBE_DRAFTER:-}" ]; then
  add_file "$SCRIBE_DRAFTER" "Working sibling for ppbe-exhibit-drafter"
else
  echo "  Not found by pattern: TT drafter in module-scribe, non critical"
fi

NEXUS_SIBLING=$(find module-nexus -iname "*classification-agent*" 2>/dev/null | head -1)
if [ -n "${NEXUS_SIBLING:-}" ]; then
  add_file "$NEXUS_SIBLING" "Working sibling for ppbe-coordination-assistant"
else
  echo "  Not found by pattern: nexus classification agent, non critical"
fi

echo "" >> "$OUT"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "$MISSING critical file(s) not found. Resolve before opening Fable 5."
else
  echo "All critical context files found."
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Context copied to clipboard, $(wc -l < "$OUT") lines."
else
  echo "pbcopy not found, context written to $OUT, copy manually."
fi

echo ""
echo "Next: open Fable 5 in Terminal 1"
