#!/usr/bin/env bash
# Governance Agent — pull the four Category 3 governance documents fresh from the
# real repo into iCloud, for re-upload to project knowledge.
# Run from anywhere; the script cds into the repo itself.

cd ~/Developer/sovereign-platform

ICLOUD_DEST="$HOME/Library/Mobile Documents/com~apple~CloudDocs/7-SOVEREIGN/current 270806"

echo "=== Confirming the iCloud destination folder ==="
mkdir -p "$ICLOUD_DEST"
ls -ld "$ICLOUD_DEST"
echo ""

copy_first_match () {
  local label="$1"
  shift
  for candidate in "$@"; do
    if [ -f "$candidate" ]; then
      cp "$candidate" "$ICLOUD_DEST/"
      echo "FOUND — $label copied from: $candidate"
      return 0
    fi
  done
  echo "NOT FOUND — $label. Checked: $*"
  return 1
}

echo "=== Copying each file (checking known name variants) ==="

copy_first_match "AGENT_REFERENCE.md" \
  "AGENT_REFERENCE.md"

copy_first_match "Agent_Identity_Standard.md" \
  "Agent_Identity_Standard.md"

copy_first_match "SBOM_Registry_v1.44" \
  "SBOM_Registry_v1.44.md" "SBOM_Registry_v1_44.md"

copy_first_match "Platform Integration Brief v1.57" \
  "SOVEREIGN_Platform_Integration_Brief_v1.57.md" "SOVEREIGN_Platform_Integration_Brief_v1_57.md"

echo ""
echo "=== What actually landed in iCloud ==="
ls -la "$ICLOUD_DEST"

echo ""
echo "=== If anything above shows NOT FOUND, run this next to locate the real filename ==="
echo 'find . -iname "*agent_reference*" -o -iname "*agent_identity*" -o -iname "*sbom_registry*" -o -iname "*integration_brief*" 2>/dev/null | grep -v node_modules'
