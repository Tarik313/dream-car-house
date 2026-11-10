#!/bin/bash
# ==============================================================================
# DREAM CAR HOUSE - Automated Production Backup Engine
# ==============================================================================
# Performs automated pg_dump of PostgreSQL and archive of media assets.
# Cron-ready: keeps rolling 7 days of daily backups. Zero secrets hardcoded.
#
# Recommended Crontab (Run daily at 3:00 AM UTC):
#   0 3 * * * /home/deploy/dream-car-house/scripts/backup.sh >> /home/deploy/backups/backup.log 2>&1
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"

mkdir -p "$BACKUP_DIR"

cd "$PROJECT_ROOT"

if [ ! -f .env.production ]; then
    echo "[$(date -Iseconds)] [ERROR] .env.production not found in $PROJECT_ROOT! Aborting backup." >&2
    exit 1
fi

# Load database credentials safely from .env.production
set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

# Verify required containers are running before executing dumps
if ! docker compose --env-file .env.production ps --services --filter "status=running" | grep -q "^postgres$"; then
    echo "[$(date -Iseconds)] [ERROR] Postgres container is not running! Cannot execute pg_dump. Aborting." >&2
    exit 1
fi

if ! docker compose --env-file .env.production ps --services --filter "status=running" | grep -q "^backend$"; then
    echo "[$(date -Iseconds)] [ERROR] Backend container is not running! Cannot archive media. Aborting." >&2
    exit 1
fi

DB_BACKUP_FILE="${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
MEDIA_BACKUP_FILE="${BACKUP_DIR}/media_${TIMESTAMP}.tar.gz"

echo "[$(date -Iseconds)] [*] Starting daily database backup for ${POSTGRES_DB}..."
docker compose --env-file .env.production exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip > "$DB_BACKUP_FILE"

if [ -s "$DB_BACKUP_FILE" ]; then
    DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
    echo "[$(date -Iseconds)] [✓] Database backup completed: $DB_BACKUP_FILE ($DB_SIZE)"
else
    echo "[$(date -Iseconds)] [ERROR] Database backup file is empty!" >&2
    exit 1
fi

echo "[$(date -Iseconds)] [*] Starting media volume archive..."
docker compose --env-file .env.production exec -T backend \
    tar -czf - -C /app/media_root/media . | cat > "$MEDIA_BACKUP_FILE"

if [ -s "$MEDIA_BACKUP_FILE" ]; then
    MEDIA_SIZE=$(du -h "$MEDIA_BACKUP_FILE" | cut -f1)
    echo "[$(date -Iseconds)] [✓] Media backup completed: $MEDIA_BACKUP_FILE ($MEDIA_SIZE)"
else
    echo "[$(date -Iseconds)] [ERROR] Media backup file is empty!" >&2
    exit 1
fi

echo "[$(date -Iseconds)] [*] Enforcing 7-day retention policy (pruning older files)..."
find "$BACKUP_DIR" -type f \( -name "db_*.sql.gz" -o -name "media_*.tar.gz" \) -mtime +7 -print -delete

echo "[$(date -Iseconds)] [✓] Backup sequence completed successfully."
