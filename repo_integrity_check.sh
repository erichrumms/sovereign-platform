#!/usr/bin/env bash
# SOVEREIGN Platform — Repository Integrity Check
#
# The standing tool AGENT_REFERENCE.md's own "Context Gather Script" section
# calls for: looks BACKWARD to verify governing documents are actually what
# they claim to be, rather than forward to deliver context for a session.
#
# bash 3.2 compatible (confirmed macOS default — no associative arrays used
# anywhere in this version; the original draft used declare -A in section [2]
# and would fail immediately on bash < 4.0).
#
# What this catches:
# 1. Near-duplicate-named files where one may be stale — flags clusters,
#    diffs them, reports whether they're identical or genuinely differ.
#    Does NOT decide which is current, and does NOT assume large clusters
#    of legitimately-versioned documents (e.g. many Integration Brief
#    versions) are bugs just because they differ — that's expected content
#    for an accumulating version history, not stale-duplicate risk. Read
#    each cluster's file list before deciding it's a problem.
# 2. Forgotten commits — any uncommitted or untracked file in the repo.
# 3. Manifest drift both directions — a manifest entry whose file is missing
#    or checksum-mismatched, AND a real governance-pattern file in the repo
#    that ISN'T in the manifest at all.
#
# IMPORTANT — verify before trusting Section 3: this assumes the manifest
# is pipe-delimited (IFS='|'). DOCUMENT_MANIFEST.tsv's own extension implies
# tab-separated. Check with `od -c DOCUMENT_MANIFEST.tsv | head -5` — if you
# see \t between fields, change IFS='|' below to IFS=$'\t' in both places
# it appears in Section 3, and change the `grep -q "^$f|"` pattern too.
#
# What this does NOT do: decide which duplicate is correct, or write handoff
# / SBOM narrative content. It surfaces evidence for a human or agent to
# judge — same posture as everything else built tonight.
#
# Usage: ./repo_integrity_check.sh [repo_root]
# Default repo_root: current directory

set -uo pipefail

REPO="${1:-.}"
cd "$REPO" || { echo "Cannot cd to $REPO"; exit 1; }

MANIFEST="DOCUMENT_MANIFEST.tsv"
ISSUES=0

echo "=== SOVEREIGN Repository Integrity Check ==="
echo "Repo: $(pwd)"
echo "Run at: $(date)"
echo "Bash version: $BASH_VERSION"
echo ""

# ------------------------------------------------------------------
echo "[1] Uncommitted or untracked files"
echo "----------------------------------------------------------------"
GIT_DIRTY=$(git status --porcelain)
if [ -z "$GIT_DIRTY" ]; then
  echo "  OK: working tree clean."
else
  echo "  FAIL: uncommitted or untracked files present:"
  echo "$GIT_DIRTY" | sed 's/^/    /'
  echo "  Every one of these needs an explicit decision: commit it,"
  echo "  gitignore it deliberately, or delete it — not leave it ambiguous."
  ISSUES=$((ISSUES+1))
fi
echo ""

# ------------------------------------------------------------------
echo "[2] Near-duplicate-named files (potential stale-copy risk)"
echo "----------------------------------------------------------------"
# bash 3.2-safe: no associative arrays. Build "stripped_key<TAB>filepath"
# lines, sort so same-key entries land adjacent, then scan sequentially.
TMPFILE=$(mktemp)
find . -maxdepth 2 \( -iname "*.md" -o -iname "*.txt" \) -not -path "*/node_modules/*" 2>/dev/null | \
while IFS= read -r f; do
  base=$(basename "$f")
  stripped=$(echo "$base" | sed -E 's/_?v[0-9]+([._][0-9]+)*//g; s/ copy//g; s/\.md$//; s/\.txt$//')
  printf '%s\t%s\n' "$stripped" "$f"
done | sort > "$TMPFILE"

FOUND_CLUSTER=0
PREV_KEY=""
CLUSTER_FILES=""

flush_cluster() {
  # $1 = key, $2 = newline-separated file list
  local key="$1"
  local files="$2"
  local count
  count=$(echo "$files" | grep -c .)
  if [ "$count" -gt 1 ]; then
    FOUND_CLUSTER=1
    echo "  CLUSTER [$key]: possible versions of the same document:"
    echo "$files" | sed 's/^/    /'
    local first all_same=1 f2
    first=$(echo "$files" | head -1)
    while IFS= read -r f2; do
      [ -z "$f2" ] && continue
      cmp -s "$first" "$f2" || all_same=0
    done <<< "$files"
    if [ "$all_same" -eq 1 ]; then
      echo "    -> byte-identical, likely harmless duplication"
    else
      echo "    -> CONTENT DIFFERS. If this is a small cluster of 2-3 files,"
      echo "       diff them and check which self-declares as current"
      echo "       (version/date/status line) before trusting either. If"
      echo "       this is a large cluster of many similarly-named files"
      echo "       (e.g. many Integration Brief versions), that is very"
      echo "       likely expected version history, not a bug — read the"
      echo "       file list before treating it as an issue."
      ISSUES=$((ISSUES+1))
    fi
  fi
}

while IFS=$'\t' read -r key file; do
  if [ "$key" = "$PREV_KEY" ]; then
    CLUSTER_FILES="$CLUSTER_FILES"$'\n'"$file"
  else
    if [ -n "$PREV_KEY" ]; then
      flush_cluster "$PREV_KEY" "$CLUSTER_FILES"
    fi
    PREV_KEY="$key"
    CLUSTER_FILES="$file"
  fi
done < "$TMPFILE"
# flush the final cluster after the loop ends
if [ -n "$PREV_KEY" ]; then
  flush_cluster "$PREV_KEY" "$CLUSTER_FILES"
fi
rm -f "$TMPFILE"

if [ "$FOUND_CLUSTER" -eq 0 ]; then
  echo "  OK: no near-duplicate-named files found at this depth."
fi
echo ""

# ------------------------------------------------------------------
echo "[3] Manifest cross-check"
echo "----------------------------------------------------------------"
if [ ! -f "$MANIFEST" ]; then
  echo "  SKIP: no $MANIFEST found at repo root."
else
  echo "  -- Manifest entries: does the file exist, does the hash match? --"
  echo "  (assumes pipe-delimited fields — verify this first, see header note)"
  while IFS='|' read -r fname dest hash lines version date; do
    [[ "$fname" == \#* || -z "$fname" ]] && continue
    if [ ! -f "$fname" ]; then
      echo "    MISSING: $fname (listed in manifest, not found in repo root)"
      ISSUES=$((ISSUES+1))
      continue
    fi
    actual_hash=$(shasum -a 256 "$fname" | awk '{print $1}')
    if [ "$actual_hash" != "$hash" ]; then
      echo "    HASH MISMATCH: $fname"
      echo "      manifest expects: $hash"
      echo "      actual:           $actual_hash"
      ISSUES=$((ISSUES+1))
    else
      echo "    OK: $fname"
    fi
  done < "$MANIFEST"

  echo ""
  echo "  -- Governance-pattern files NOT in the manifest --"
  shopt -s nullglob
  for f in SOVEREIGN_*.md docs_*.md *_Architecture.md Agent_Identity_Standard.md AGENT_REFERENCE.md; do
    [ -f "$f" ] || continue
    if ! grep -q "^$f|" "$MANIFEST" 2>/dev/null; then
      echo "    UNTRACKED BY MANIFEST: $f"
      echo "      Either add it to $MANIFEST, or confirm deliberately that"
      echo "      it doesn't need version tracking."
    fi
  done
  shopt -u nullglob
fi
echo ""

# ------------------------------------------------------------------
echo "=== Summary ==="
if [ "$ISSUES" -eq 0 ]; then
  echo "RESULT: CLEAN — no staleness, duplication, or drift detected."
else
  echo "RESULT: $ISSUES issue(s) found. Review each before treating any"
  echo "governance document as current."
fi
