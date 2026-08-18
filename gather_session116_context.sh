#!/bin/bash
# SOVEREIGN — Session 116 Context Gather Script
# Terminal 2 only. Read-only. Concatenates required context, copies to clipboard.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }

OUT="/tmp/sovereign_session116_context.txt"
> "$OUT"

FILES=(
  "SOVEREIGN_Session116_Build_Brief_20260817.md"
  "SOVEREIGN_CTO_Demonstration_Script_20260816.md"
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "CLAUDE.md"
)

FOUND=0
TOTAL=${#FILES[@]}
MISSING=()

echo "SOVEREIGN — Session 116 context gather   $(date '+%Y-%m-%d %H:%M')"
echo "HEAD: $(git rev-parse --short HEAD)"
echo

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "===== FILE: $f =====" >> "$OUT"
    cat "$f" >> "$OUT"
    echo -e "\n\n" >> "$OUT"
    FOUND=$((FOUND+1))
    echo "  found: $f"
  else
    MISSING+=("$f")
    echo "  MISSING: $f"
  fi
done

echo
echo "$FOUND of $TOTAL found, ${#MISSING[@]} missing."

if [ ${#MISSING[@]} -gt 0 ]; then
  echo
  echo "BLOCKED — do not paste. Missing files listed above."
  echo "Session 116's Build Brief is the primary spec (F-1 through F-39)."
  echo "AGENT_REFERENCE.md is next-highest priority if something must be dropped —"
  echo "it carries Rules 11-17 (close protocol, baseline discipline, Build/Governance"
  echo "boundary) that this session must not violate."
  if [ ! -f "CLAUDE.md" ]; then
    echo
    echo "Note: CLAUDE.md not found at repo root. If it lives elsewhere, update the"
    echo "path above and re-run. §4 (Build Agent never authors governance documents)"
    echo "is referenced throughout this session's scope and should be available."
  fi
  exit 1
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Copied to clipboard. Paste into Claude Code as the first message,"
  echo "then paste the Session 116 opening prompt as the second."
else
  echo "pbcopy not found — context written to $OUT, copy manually."
fi
