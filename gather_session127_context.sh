#!/bin/bash
# SOVEREIGN — Session 127 Context Gather Script
# Terminal 2 only. Read-only. Concatenates required context, copies to clipboard.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }

OUT="/tmp/sovereign_session127_context.txt"
> "$OUT"

FILES=(
  "AGENT_REFERENCE.md"
  "DOCUMENT_MANIFEST.tsv"
  "CLAUDE.md"
)

FOUND=0
TOTAL=${#FILES[@]}
MISSING=()

echo "SOVEREIGN — Session 127 context gather   $(date '+%Y-%m-%d %H:%M')"
echo "HEAD: $(git rev-parse --short HEAD)"
echo "Expected prior close: Session 126, terminal HEAD b4e3fb0 — confirm below."
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
  exit 1
fi

echo
echo "Note: this gather script deliberately does NOT include the individual"
echo "SBOM_Session*_Update.md files or SBOM_Registry_v1.83_MERGED.md — this"
echo "session reads those directly via its own broad search once launched,"
echo "per the Backlog's own R12 guidance against over-curated gather scripts"
echo "for audit-phase work. Confirm below that the merge source files exist:"
echo
ls -la SBOM_Registry_v1.83_MERGED.md 2>&1
ls SBOM_Session1{15,16,17,18,19,20,21,22,23,24,25,26}_Update.md 2>&1
echo "(A 'No such file' line above for any of these is expected to be"
echo "investigated by the session, not treated as blocking this script.)"

if command -v pbcopy >/dev/null 2>&1; then
  cat "$OUT" | pbcopy
  echo
  echo "Copied to clipboard. Paste into Claude Code as the first message,"
  echo "then paste the Session 127 opening prompt (SBOM Registry merge) as"
  echo "the second."
else
  echo "pbcopy not found — context written to $OUT, copy manually."
fi
