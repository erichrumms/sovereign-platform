#!/bin/bash
# SOVEREIGN — Defect Corpus Extraction. TERMINAL 2 ONLY. Read-only.
set -u
cd ~/Developer/sovereign-platform || exit 1
echo; echo "SOVEREIGN — defect corpus  HEAD $(git rev-parse --short HEAD)  $(date '+%F %H:%M')"

echo; echo "=== 1. THE LESSONS 13-23 LEAD ==="
echo "-- PROJECT_SUMMARY.md Part 7 --"
sed -n '/Part 7 — Broadly Applicable Lessons/,/^## Part 8/p' PROJECT_SUMMARY.md 2>/dev/null | head -70
echo "-- every 'Lesson N' anywhere, any format --"
grep -rnoE "Lesson [0-9]+" --include="*.md" . 2>/dev/null | grep -v node_modules \
  | awk -F: '{print $1}' | sort | uniq -c | sort -rn | head -12

echo; echo "=== 2. AGENT_REFERENCE lesson inventory (find the real gaps) ==="
grep -oE "^#+ *Lesson [0-9]+" AGENT_REFERENCE.md | grep -oE "[0-9]+" | sort -n | tr '\n' ' '
echo; echo "-- full lesson titles, to check for duplicates before adding 40+ --"
grep -E "^#+ *Lesson [0-9]+" AGENT_REFERENCE.md | cut -c1-100

echo; echo "=== 3. FINDING IDENTIFIERS EVER USED — the real corpus ==="
for pre in WH WF WE WG D3 D4 F1 F2 GD WG; do
  n=$(grep -rhoE "\b${pre}-[0-9]+\b" --include="*.md" . 2>/dev/null | grep -v node_modules | sort -u | wc -l | tr -d ' ')
  [ "$n" -gt 0 ] && echo "  ${pre}-  : $n distinct identifiers"
done
echo "  -- highest in each series --"
for pre in WH WF D3 D4; do
  echo -n "  ${pre}: "; grep -rhoE "\b${pre}-[0-9]+\b" --include="*.md" . 2>/dev/null | grep -v node_modules | grep -oE "[0-9]+" | sort -n | tail -1
done

echo; echo "=== 4. DEFECT-CLASS FREQUENCY across all findings documents ==="
declare -a CLASS=(
  "stale-hardcoded:hardcoded|stale|frozen|never updated|out of date|placeholder"
  "cross-artifact-drift:does not match|doesn't match|disagree|mismatch|drifted|inconsistent|divergence"
  "citation-error:phantom|cites.*not exist|wrong (document|section|number)|citation"
  "duplicate-state:two (independently|separate|different)|duplicated|parallel|both copies|second copy"
  "silent-failure:silently|no warning|without warning|no disclosure|quietly"
  "root-cause-elsewhere:same root cause|elsewhere|other instances|search the codebase"
  "test-gap:test gap|no test|untested|test did not|passing test"
  "unverified-claim:fabricat|not verified|assumed|unsubstantiated|false claim|claimed but"
  "not-a-bug:not a bug|ruled out|expected behavior|by design|working as"
  "scope-deferred:deferred|not authorized|out of scope|future session|Stage 4"
)
for c in "${CLASS[@]}"; do
  name="${c%%:*}"; pat="${c#*:}"
  n=$(grep -rliE "$pat" --include="*.md" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
  hits=$(grep -rhoiE "$pat" --include="*.md" . 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
  printf "  %-22s docs=%-4s mentions=%s\n" "$name" "$n" "$hits"
done

echo; echo "=== 5. CODE-LEVEL DRIFT CANDIDATES (what a check could catch) ==="
echo "-- hardcoded hashes/versions in scripts and code --"
grep -rnoE "v1\.[0-9]+|[a-f0-9]{16,64}" --include="*.sh" . 2>/dev/null | grep -v node_modules | wc -l | sed 's/^/  literal version-or-hash occurrences in .sh: /'
echo "-- TODO / FIXME / PROVISIONAL / stale markers in source --"
grep -rniE "TODO|FIXME|PROVISIONAL|HACK|XXX|stale" --include="*.ts" --include="*.tsx" --include="*.py" . 2>/dev/null | grep -v node_modules | wc -l | sed 's/^/  count: /'
grep -rniE "TODO|FIXME|PROVISIONAL|HACK|XXX" --include="*.ts" --include="*.tsx" --include="*.py" . 2>/dev/null | grep -v node_modules | head -12 | cut -c1-115 | sed 's/^/    /'
echo "-- event types in shell contract vs shared-types (the Constraint #11 class) --"
echo -n "  shell-contract event union members: "; grep -cE '^\s*\| "[A-Z_]+"' shell-contract.ts 2>/dev/null
echo -n "  shared-types members:               "; grep -cE '"[A-Z_]+"' sovereign-data/src/shared-types.ts 2>/dev/null

echo; echo "=== 6. SESSIONS THAT FIXED A PRIOR SESSION'S OWN OUTPUT ==="
grep -rlniE "corrected (from|in) session|reintroduc|regressed|fixed .*prior session|previous session.*wrong" --include="*.md" . 2>/dev/null | grep -v node_modules | head -12 | sed 's/^/  /'
echo
