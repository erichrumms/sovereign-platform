#!/bin/bash
# SOVEREIGN — Session 118 Context Gather Script
# Terminal 2 only. Read-only. Concatenates required context, copies to clipboard.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }

OUT="/tmp/sovereign_session118_context.txt"
> "$OUT"

FILES=(
  "SOVEREIGN_Session118_Build_Brief_20260819.md"
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "CLAUDE.md"
)

FOUND=0
TOTAL=${#FILES[@]}
MISSING=()

echo "SOVEREIGN — Session 118 context gather   $(date '+%Y-%m-%d %H:%M')"
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
  echo "SOVEREIGN_Session118_Build_Brief_20260819.md is the primary spec (F-40 through F-50)."
  exit 1
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo "Copied to clipboard. Paste into Claude Code as the first message,"
  echo "then paste the Session 118 opening prompt as the second."
else
  echo "pbcopy not found — context written to $OUT, copy manually."
fi
