#!/bin/bash
# SOVEREIGN — Review-Record Inventory. TERMINAL 2 ONLY. Read-only.
# Reads document CONTENT, not filenames, to find prior findings/review records.
set -u
cd ~/Developer/sovereign-platform || { echo "FAIL: repo not found"; exit 1; }
echo; echo "SOVEREIGN — review-record inventory (read-only)"
echo "HEAD: $(git rev-parse --short HEAD 2>/dev/null)   $(date '+%Y-%m-%d %H:%M')"; echo

TMP="$(mktemp)"
STRUCTURAL='^#+.*(Finding|Issue|Gap|Defect|Observation|Action Plan|What Went Wrong|Lesson|Correction|Discrepanc)'
SEVERITY='\b(MAJOR|MINOR|BROKEN|CRITICAL|BLOCKER|P1)\b'
FINDINGID='(Finding|Issue|Gap|Item|Defect)[ _-]?#?[0-9]+|WH-[0-9]+'
DIAGNOSIS='(root cause|ruled out|not a bug|false claim|silently|never actually|turned out to be|does not match|contradict|understated|overstated|stale|drift)'
DISPOSITION='(Resolved|Closed|Corrected|Fixed|Deferred|Not reproduced|Awaiting decision|No action)'

while IFS= read -r f; do
  [ -f "$f" ] || continue
  a=$(grep -ciE "$STRUCTURAL" "$f" 2>/dev/null); a=${a:-0}
  b=$(grep -ciE "$DIAGNOSIS" "$f" 2>/dev/null); b=${b:-0}
  c=$(grep -coE "$FINDINGID" "$f" 2>/dev/null); c=${c:-0}
  d=$(grep -ciE "$DISPOSITION" "$f" 2>/dev/null); d=${d:-0}
  e=$(grep -coE "$SEVERITY" "$f" 2>/dev/null); e=${e:-0}
  t=$(( a*5 + b*3 + c*2 + d + e ))
  [ "$t" -lt 8 ] && continue
  printf '%06d\t%s\t%s\t%s\t%s\t%s\t%s\n' "$t" "$f" "$a" "$b" "$c" "$d" "$e" >> "$TMP"
done < <(find . -path ./node_modules -prune -o -name "*.md" -print 2>/dev/null)

echo "$(find . -path ./node_modules -prune -o -name '*.md' -print 2>/dev/null | wc -l | tr -d ' ') files scanned; $(wc -l < "$TMP" | tr -d ' ') scored above threshold."
echo; echo "============================================================"
echo "RANKED REVIEW-RECORD CANDIDATES"
echo "============================================================"
sort -rn "$TMP" | head -25 | while IFS=$'\t' read -r s p a b c d e; do
  echo; echo "------------------------------------------------------------"
  echo "SCORE $((10#$s))  $p"
  echo "   struct=$a diag=$b id=$c disp=$d sev=$e  lines=$(wc -l < "$p" | tr -d ' ')"
  echo "   TITLE : $(grep -m1 '^#' "$p" 2>/dev/null | sed 's/^#* *//' | cut -c1-90)"
  echo "   DATE  : $(grep -m1 -oE '(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{1,2}, 202[0-9]' "$p" 2>/dev/null)"
  echo "   -- finding-shaped headings --"
  grep -inE "$STRUCTURAL" "$p" 2>/dev/null | head -5 | cut -c1-105 | sed 's/^/        /'
  echo "   -- sample diagnostic lines --"
  grep -inE "$DIAGNOSIS" "$p" 2>/dev/null | head -3 | cut -c1-105 | sed 's/^/        /'
done

echo; echo "============================================================"
echo "WHERE 'LESSONS' AND 'RULES' ALREADY LIVE"
echo "============================================================"
grep -rlE "^#+ *Lesson [0-9]+" --include="*.md" . 2>/dev/null | grep -v node_modules | while read -r f; do
  echo "  LESSONS: $f — $(grep -cE '^#+ *Lesson [0-9]+' "$f") headings, highest $(grep -oE '^#+ *Lesson [0-9]+' "$f" | grep -oE '[0-9]+' | sort -n | tail -1)"
done
grep -rlE "^#+ *Rule [0-9]+" --include="*.md" . 2>/dev/null | grep -v node_modules | while read -r f; do
  echo "  RULES  : $f — $(grep -cE '^#+ *Rule [0-9]+' "$f") headings"
done

echo; echo "============================================================"
echo "SELF-CORRECTION RECORD — documents describing a claim found wrong"
echo "============================================================"
grep -rlniE "was found wrong|found to be wrong|claim (was|is) false|never actually (happened|performed|committed)|retracted" --include="*.md" . 2>/dev/null | grep -v node_modules | head -15 | while read -r f; do
  echo "  $f"
  grep -inE "was found wrong|found to be wrong|claim (was|is) false|never actually (happened|performed|committed)|retracted" "$f" 2>/dev/null | head -2 | cut -c1-110 | sed 's/^/      /'
done

echo; echo "============================================================"
echo "ARE THESE REVIEW RECORDS IN THE MANIFEST?"
echo "============================================================"
sort -rn "$TMP" | head -20 | while IFS=$'\t' read -r s p rest; do
  bn=$(basename "$p")
  grep -q "$bn" DOCUMENT_MANIFEST.tsv 2>/dev/null && echo "  TRACKED  : $bn" || echo "  UNTRACKED: $bn"
done
rm -f "$TMP"
echo; echo "Scores rank shape, not importance. Reading confirms; the score only ranks."
echo "Purpose: find where findings ALREADY live, so new lessons extend that"
echo "lineage instead of starting a parallel one."
echo
