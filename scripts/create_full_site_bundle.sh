#!/usr/bin/env bash
# ==============================================================================
# DREAM CAR HOUSE - Master Standalone Migration Packager
# ==============================================================================
# Packages 100% of the project into a single master archive:
#   1. Clean Source Code (Frontend UI/UX, Dashboard, Backend, Nginx, Docker)
#   2. Latest PostgreSQL Database Dump
#   3. Latest Media Photos & Showroom Assets
#   4. Production Environment Configuration (.env.production)
#   5. 1-Click Restore Script (restore.sh)
#
# Output:
#   /home/deploy/backups/dreamcarhouse_master_migration_YYYYMMDD_HHMMSS.tar.gz
#   /home/deploy/backups/dreamcarhouse_master_migration_latest.tar.gz
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_ROOT"

echo "[*] Step 1/4: Taking live database & media snapshot..."
/bin/bash "$PROJECT_ROOT/scripts/backup.sh"

LATEST_DB=$(ls -t "$BACKUP_DIR"/db_*.sql.gz | head -n 1)
LATEST_MEDIA=$(ls -t "$BACKUP_DIR"/media_*.tar.gz | head -n 1)

echo "[✓] Using latest database: $LATEST_DB"
echo "[✓] Using latest media: $LATEST_MEDIA"

TMP_STAGE="/tmp/dch_migration_bundle_${TIMESTAMP}"
rm -rf "$TMP_STAGE"
mkdir -p "$TMP_STAGE"

echo "[*] Step 2/4: Exporting clean source code & UI/UX from Git..."
git archive HEAD | tar -x -C "$TMP_STAGE"

echo "[*] Step 3/4: Packing environment, database dump, media assets & 1-click restore script..."
cp .env.production "$TMP_STAGE/.env.production"
cp "$LATEST_DB" "$TMP_STAGE/database.sql.gz"
cp "$LATEST_MEDIA" "$TMP_STAGE/media.tar.gz"
chmod +x "$TMP_STAGE/scripts/restore_full_site.sh"
cp "$TMP_STAGE/scripts/restore_full_site.sh" "$TMP_STAGE/restore.sh"
chmod +x "$TMP_STAGE/restore.sh"

BUNDLE_FILE="${BACKUP_DIR}/dreamcarhouse_master_migration_${TIMESTAMP}.tar.gz"
LATEST_SYMLINK="${BACKUP_DIR}/dreamcarhouse_master_migration_latest.tar.gz"

echo "[*] Step 4/4: Generating compressed master bundle..."
tar -czf "$BUNDLE_FILE" -C "$TMP_STAGE" .
rm -rf "$TMP_STAGE"

cp -f "$BUNDLE_FILE" "$LATEST_SYMLINK"

BUNDLE_SIZE=$(du -h "$BUNDLE_FILE" | cut -f1)
echo "======================================================================"
echo "  [SUCCESS] MASTER MIGRATION BUNDLE CREATED!"
echo "  File: $BUNDLE_FILE ($BUNDLE_SIZE)"
echo "  Symlink: $LATEST_SYMLINK"
echo "  Contains: Full UI/UX Code + Database + Photos + Config + 1-Click Restore"
echo "======================================================================"
