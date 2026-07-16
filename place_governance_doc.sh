#!/usr/bin/env bash
# SOVEREIGN Platform — Governance Document Placement Script
#
# Usage: ./place_governance_doc.sh <filename>
#
# Looks up <filename> in DOCUMENT_MANIFEST.tsv, verifies the copy sitting in the
# staging folder actually matches the expected checksum, and ONLY THEN places it
# at its correct destination (repo or iCloud). On success, the staged copy is
# moved to an archive folder with a timestamp — never left sitting in staging,
# so a stale file can't be picked up by a future placement by accident.
#
# This exists because a clean `cp`, a clean `git commit`, and a clean `git push`
# were all shown, on this project, to be fully consistent with the WRONG file
# having been moved. This script makes "the content is correct" a checked fact,
# not an assumed one. See AGENT_REFERENCE.md Rule 10.

set -uo pipefail

REPO_DIR="$HOME/Developer/sovereign-platform"
ICLOUD_GOV_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/7 - SOVEREIGN/Companion Suite/Governance"
STAGING_DIR="$HOME/SOVEREIGN_Staging"
ARCHIVE_DIR="$STAGING_DIR/placed_archive"
MANIFEST="$REPO_DIR/DOCUMENT_MANIFEST.tsv"
LOG_FILE="$REPO_DIR/PLACEMENT_LOG.tsv"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <filename>"
  echo "The file must already be sitting in $STAGING_DIR"
  exit 1
fi

FILENAME="$1"
STAGED_FILE="$STAGING_DIR/$FILENAME"

mkdir -p "$STAGING_DIR" "$ARCHIVE_DIR"

echo "=== SOVEREIGN Document Placement: $FILENAME ==="
echo ""

# --- Step 1: staged file must exist ---
if [ ! -f "$STAGED_FILE" ]; then
  echo "FAIL: $STAGED_FILE not found."
  echo "Download the file and place it in $STAGING_DIR first — not Downloads,"
  echo "not the repo, not iCloud directly. Staging only, every time."
  exit 1
fi

# --- Step 2: manifest must exist and have an entry for this file ---
if [ ! -f "$MANIFEST" ]; then
  echo "FAIL: manifest not found at $MANIFEST"
  exit 1
fi

MANIFEST_LINE=$(grep "^${FILENAME}|" "$MANIFEST" | head -1)
if [ -z "$MANIFEST_LINE" ]; then
  echo "FAIL: no manifest entry for $FILENAME."
  echo "This script will not place a file with no expected checksum on record —"
  echo "add an entry to $MANIFEST first (the Governance Agent should have"
  echo "provided the hash and line count alongside the file)."
  exit 1
fi

DESTINATION=$(echo "$MANIFEST_LINE" | cut -d'|' -f2)
EXPECTED_HASH=$(echo "$MANIFEST_LINE" | cut -d'|' -f3)
EXPECTED_LINES=$(echo "$MANIFEST_LINE" | cut -d'|' -f4)
VERSION_LABEL=$(echo "$MANIFEST_LINE" | cut -d'|' -f5)

echo "Manifest entry found: destination=$DESTINATION, version=$VERSION_LABEL"
echo "Expected: $EXPECTED_LINES lines, sha256 $EXPECTED_HASH"
echo ""

# --- Step 3: verify the staged file matches, before touching anything else ---
ACTUAL_HASH=$(shasum -a 256 "$STAGED_FILE" | cut -d' ' -f1)
ACTUAL_LINES=$(wc -l < "$STAGED_FILE" | tr -d ' ')

echo "Staged file:   $ACTUAL_LINES lines, sha256 $ACTUAL_HASH"

if [ "$ACTUAL_HASH" != "$EXPECTED_HASH" ]; then
  echo ""
  echo "FAIL: checksum mismatch. This is NOT the file the manifest expects."
  echo "This is exactly the failure that deleted the Time & Travel section"
  echo "from Agent_Identity_Standard.md earlier this project — a stale or"
  echo "wrong file with the right name. STOPPING. Nothing has been placed,"
  echo "nothing has been moved. Re-download the correct file and try again."
  exit 1
fi

if [ "$ACTUAL_LINES" != "$EXPECTED_LINES" ]; then
  echo ""
  echo "FAIL: line count mismatch even though hash check was skipped or passed —"
  echo "this shouldn't happen if the hash matched. Investigate manually before"
  echo "proceeding. STOPPING."
  exit 1
fi

echo "MATCH: staged file is verified correct."
echo ""

# --- Step 4: place at the correct destination ---
case "$DESTINATION" in
  repo)
    cp "$STAGED_FILE" "$REPO_DIR/$FILENAME"
    PLACED_HASH=$(shasum -a 256 "$REPO_DIR/$FILENAME" | cut -d' ' -f1)
    if [ "$PLACED_HASH" != "$EXPECTED_HASH" ]; then
      echo "FAIL: file copied to repo but hash doesn't match post-copy. Filesystem"
      echo "issue — do not commit. Investigate manually."
      exit 1
    fi
    echo "Placed in repo, hash re-verified post-copy: OK"
    echo ""
    echo "Next steps (not run automatically — commit is a deliberate action):"
    echo "  cd \"$REPO_DIR\""
    echo "  git add \"$FILENAME\""
    echo "  git commit -m \"docs: place $FILENAME ($VERSION_LABEL), checksum-verified\""
    echo "  git push"
    echo "  git show HEAD:\"$FILENAME\" | shasum -a 256    # confirm: $EXPECTED_HASH"
    ;;
  icloud)
    cp "$STAGED_FILE" "$ICLOUD_GOV_DIR/$FILENAME"
    PLACED_HASH=$(shasum -a 256 "$ICLOUD_GOV_DIR/$FILENAME" | cut -d' ' -f1)
    if [ "$PLACED_HASH" != "$EXPECTED_HASH" ]; then
      echo "FAIL: file copied to iCloud but hash doesn't match post-copy."
      echo "Investigate manually before trusting this placement."
      exit 1
    fi
    echo "Placed in iCloud Governance/, hash re-verified post-copy: OK"
    ;;
  project_knowledge)
    echo "This file's destination is Claude.ai project knowledge, which isn't"
    echo "scriptable from the command line. Manually replace the file in project"
    echo "file management using the copy at: $STAGED_FILE"
    echo "It will NOT be auto-archived — do that yourself once replaced."
    exit 0
    ;;
  *)
    echo "FAIL: unrecognized destination '$DESTINATION' in manifest. Fix the"
    echo "manifest entry — expected repo, icloud, or project_knowledge."
    exit 1
    ;;
esac

# --- Step 5: archive the staged file so it can NEVER be picked up stale again ---
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mv "$STAGED_FILE" "$ARCHIVE_DIR/${TIMESTAMP}_${FILENAME}"
echo ""
echo "Staged copy archived to: $ARCHIVE_DIR/${TIMESTAMP}_${FILENAME}"
echo "Staging folder is clear of this file — nothing left to be picked up stale."

# --- Step 6: log the placement for audit trail ---
echo -e "${FILENAME}\t${VERSION_LABEL}\t${DESTINATION}\t${EXPECTED_HASH}\t$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG_FILE"
echo "Logged to $LOG_FILE"
