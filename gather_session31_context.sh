#!/usr/bin/env bash
set -uo pipefail

OUT="/tmp/session31_context.md"
> "$OUT"

echo "SOVEREIGN Session 31 — Core Integration — Context Gather (v2)" >> "$OUT"
echo "Generated: $(date)" >> "$OUT"
echo "" >> "$OUT"

MISSING=0

add_file() {
  local path="$1"
  local label="$2"
  if [ -f "$path" ]; then
    echo "  ✓ $path"
    {
      echo "----------------------------------------------------------------"
      echo "FILE: $path"
      echo "PURPOSE: $label"
      echo "----------------------------------------------------------------"
      cat "$path"
      echo ""
    } >> "$OUT"
  else
    echo "  ⚠ MISSING: $path  ($label)"
    MISSING=$((MISSING+1))
  fi
}

echo "Gathering Session 31 context files..."
echo ""

add_file "AGENT_REFERENCE.md" "Prompt-authorship workflow (Claude Code authors, marks PENDING)"
add_file "Agent_Identity_Standard.md" "Canonical agent registry"
add_file "shell-contract.ts" "Frozen shell contract — verify SHA-256 matches v1.16"

BRIEF_A="SOVEREIGN_Platform_Integration_Brief_v1.41.md"
BRIEF_B="SOVEREIGN_Platform_Integration_Brief_v1_41.md"
echo ""
echo "Resolving Integration Brief (two files found claiming v1.41)..."
if [ -f "$BRIEF_A" ] && [ -f "$BRIEF_B" ]; then
  if diff -q "$BRIEF_A" "$BRIEF_B" > /dev/null 2>&1; then
    echo "  ✓ Both v1.41 files are byte-identical — using $BRIEF_A"
    add_file "$BRIEF_A" "Integration Brief v1.41 (duplicate confirmed identical)"
  else
    NEWER=$(ls -t "$BRIEF_A" "$BRIEF_B" | head -1)
    echo "  ⚠ WARNING: the two v1.41 files DIFFER. Using newer by mtime: $NEWER"
    add_file "$NEWER" "Integration Brief v1.41 — CAUTION: differing duplicate exists"
  fi
elif [ -f "$BRIEF_A" ]; then
  add_file "$BRIEF_A" "Integration Brief v1.41"
elif [ -f "$BRIEF_B" ]; then
  add_file "$BRIEF_B" "Integration Brief v1.41"
else
  echo "  ⚠ MISSING: no v1.41 Integration Brief found at root."
  MISSING=$((MISSING+1))
fi
echo ""

PPBE_SPEC=$(find docs -iname "*ppbe*workflow*" -o -iname "*18*ppbe*" 2>/dev/null | head -1)
if [ -n "${PPBE_SPEC:-}" ]; then
  add_file "$PPBE_SPEC" "PPBE build spec — authoritative for this session"
else
  echo "  ⚠ MISSING: docs/18 PPBE Workflow Architecture not found in docs/"
  MISSING=$((MISSING+1))
fi

STRAT_PLAN=$(find docs -iname "*strategic_plan*" 2>/dev/null | head -1)
if [ -n "${STRAT_PLAN:-}" ]; then
  add_file "$STRAT_PLAN" "Current sequencing/status"
else
  echo "  ⚠ MISSING: Strategic Plan not found in docs/ — may need to be copied in and committed."
  MISSING=$((MISSING+1))
fi

LOGGER=$(find . -iname "sovereign_logger.py" -not -path "./node_modules/*" 2>/dev/null | head -1)
if [ -n "${LOGGER:-}" ]; then
  add_file "$LOGGER" "Logger schema — PPBE event types"
else
  echo "  ⚠ MISSING: sovereign_logger.py not found."
  MISSING=$((MISSING+1))
fi

for pattern in "*escalation-monitor*" "*pattern-analyst*" "*nexus-contract*"; do
  MATCH=$(find module-nexus module-vigil module-apex module-scribe -iname "$pattern" -not -path "*/node_modules/*" 2>/dev/null | head -1)
  if [ -n "${MATCH:-}" ]; then
    add_file "$MATCH" "Working sibling for pattern reference ($pattern)"
  else
    echo "  ⚠ Not found by pattern: $pattern (non-critical)"
  fi
done

echo "" >> "$OUT"

if [ "$MISSING" -gt 0 ]; then
  echo ""
  echo "⚠  $MISSING critical file(s) not found. Review warnings above."
else
  echo "✓ All critical context files found and resolved."
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "✓ Context copied to clipboard ($(wc -l < "$OUT") lines)."
else
  echo "pbcopy not found — context written to $OUT, copy manually."
fi

echo ""
echo "Next: open Claude Code (Terminal 1) via:"
echo "  caffeinate -i claude --dangerously-skip-permissions"
echo "Paste the clipboard content first, then paste the Session 31 opening prompt."
