#!/usr/bin/env bash
set -euo pipefail

# Safe Let's Encrypt certificate renewal + zero-downtime Nginx reload.
# Recommended root crontab entry (daily at 04:15 UTC):
#   15 4 * * * /bin/bash /home/deploy/dream-car-house/scripts/renew_letsencrypt.sh >> /home/deploy/backups/ssl-renew.log 2>&1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

if [ ! -f .env.production ]; then
    echo "[$(date -Iseconds)] [ERROR] .env.production missing in $REPO_DIR" >&2
    exit 1
fi

COMPOSE=(docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.letsencrypt.yml)

"${COMPOSE[@]}" run --rm --entrypoint certbot certbot renew --webroot -w /var/www/certbot --quiet
"${COMPOSE[@]}" exec -T nginx nginx -s reload
echo "[$(date -Iseconds)] [OK] Let's Encrypt renewal check and nginx reload complete."
