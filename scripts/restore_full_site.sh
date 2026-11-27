#!/usr/bin/env bash
# ==============================================================================
# DREAM CAR HOUSE - 1-Click Disaster Recovery & Migration Script
# ==============================================================================
# Quickly spins up the complete website, database, media assets, and dashboard
# on ANY new Linux server with Docker and Docker Compose installed.
#
# Usage:
#   sudo bash restore.sh (or sudo bash scripts/restore_full_site.sh)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    PROJECT_DIR="$SCRIPT_DIR"
elif [ -f "$(dirname "$SCRIPT_DIR")/docker-compose.yml" ]; then
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
else
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR"

echo "======================================================================"
echo "  DREAM CAR HOUSE — Automated 1-Click Site Restore Engine"
echo "======================================================================"

# 1. Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "[ERROR] Docker is not installed on this system. Please install docker first." >&2; exit 1; }

if ! docker compose version >/dev/null 2>&1; then
    echo "[ERROR] 'docker compose' (v2) is not available. Please install docker-compose-plugin." >&2
    exit 1
fi

if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production file is missing in $(pwd)!" >&2
    exit 1
fi

# Load variables safely
set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

# Find backup archives
DB_DUMP=""
if [ -f "database.sql.gz" ]; then
    DB_DUMP="database.sql.gz"
elif [ -f "database.sql" ]; then
    DB_DUMP="database.sql"
else
    LATEST_DB=$(ls -t db_*.sql.gz 2>/dev/null | head -n 1 || true)
    if [ -n "$LATEST_DB" ]; then
        DB_DUMP="$LATEST_DB"
    fi
fi

MEDIA_ARCHIVE=""
if [ -f "media.tar.gz" ]; then
    MEDIA_ARCHIVE="media.tar.gz"
else
    LATEST_MEDIA=$(ls -t media_*.tar.gz 2>/dev/null | head -n 1 || true)
    if [ -n "$LATEST_MEDIA" ]; then
        MEDIA_ARCHIVE="$LATEST_MEDIA"
    fi
fi

echo "[*] Step 1/5: Starting core database & cache infrastructure..."
docker compose --env-file .env.production up -d postgres redis

echo "[*] Waiting for PostgreSQL database to be ready..."
until docker compose --env-file .env.production exec -T postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; do
    echo "    - Waiting for postgres..."
    sleep 2
done
echo "[✓] PostgreSQL is ready and accepting connections."

# Step 2: Restore Database
if [ -n "$DB_DUMP" ] && [ -f "$DB_DUMP" ]; then
    echo "[*] Step 2/5: Restoring database from $DB_DUMP..."
    if [[ "$DB_DUMP" == *.gz ]]; then
        gzip -dc "$DB_DUMP" | docker compose --env-file .env.production exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null
    else
        docker compose --env-file .env.production exec -T postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" < "$DB_DUMP" >/dev/null
    fi
    echo "[✓] Database restore completed successfully."
else
    echo "[!] No database dump found (skipping database restore). Starting fresh."
fi

# Step 3: Start Backend container
echo "[*] Step 3/5: Starting Django backend application..."
docker compose --env-file .env.production up -d --build backend
until docker compose --env-file .env.production exec -T backend python -c "import django; django.setup()" >/dev/null 2>&1; do
    echo "    - Waiting for backend..."
    sleep 2
done
echo "[✓] Backend is ready."

# Step 4: Restore Media assets
if [ -n "$MEDIA_ARCHIVE" ] && [ -f "$MEDIA_ARCHIVE" ]; then
    echo "[*] Step 4/5: Restoring media assets (car images, logos) from $MEDIA_ARCHIVE..."
    docker compose --env-file .env.production exec -T backend mkdir -p /app/media_root/media
    cat "$MEDIA_ARCHIVE" | docker compose --env-file .env.production exec -T backend tar -xzf - -C /app/media_root/media
    docker compose --env-file .env.production exec -T backend chmod -R a+rX /app/media_root/media
    echo "[✓] Media assets restored successfully."
else
    echo "[!] No media archive found (skipping media restore)."
fi

# Step 5: Build and Start Full UI/UX (Frontend, Dashboard, Nginx)
echo "[*] Step 5/5: Building and launching Frontend, Dashboard, and Nginx proxy..."
docker compose --env-file .env.production build frontend dashboard
docker compose --env-file .env.production up -d --force-recreate --no-deps frontend dashboard nginx

# Final healthcheck & reload
sleep 3
docker compose --env-file .env.production exec -T nginx nginx -s reload >/dev/null 2>&1 || true

echo "======================================================================"
echo "  [SUCCESS] DREAM CAR HOUSE IS FULLY RESTORED & OPERATIONAL!"
echo "  - Public Website: http://localhost (or server IP / domain)"
echo "  - Enterprise Dashboard: http://localhost/login"
echo "  - Django Admin: http://localhost/admin/"
echo "======================================================================"
