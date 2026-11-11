#!/usr/bin/env bash
set -euo pipefail

# Issue initial Let's Encrypt TLS certificate via webroot HTTP-01 and switch Nginx to HTTPS.
# Prerequisites:
#   1. DNS A records for dreamcarhouse.com and www.dreamcarhouse.com already point to this server.
#   2. Port 80 and Port 443 are allowed in firewall (e.g. ufw allow 80/tcp 443/tcp).
# Usage:
#   sudo bash scripts/setup_letsencrypt.sh [email]

CERTBOT_EMAIL="${1:-admin@dreamcarhouse.com}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production is missing in $REPO_DIR!" >&2
    exit 1
fi

COMPOSE=(docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.letsencrypt.yml)
BASE_COMPOSE=(docker compose --env-file .env.production -f docker-compose.yml)

# Ensure nginx is running cleanly on HTTP port 80 before ACME HTTP-01 checks
# (also recovers cleanly if nginx is stopped or crash-looping without certificates yet)
if ! "${BASE_COMPOSE[@]}" ps --services --filter "status=running" | grep -q "^nginx$" \
   || ! "${BASE_COMPOSE[@]}" exec -T nginx test -s /etc/letsencrypt/live/dreamcarhouse.com/fullchain.pem >/dev/null 2>&1; then
    echo "[*] Ensuring nginx is running in HTTP mode (port 80) for ACME HTTP-01..."
    export COMPOSE_PARALLEL_LIMIT=1
    "${BASE_COMPOSE[@]}" up -d --wait nginx
fi

PROBE_TOKEN="dch-acme-$(date +%s)-$$"
PROBE_DIR="/var/www/certbot/.well-known/acme-challenge"
PROBE_FILE="${PROBE_DIR}/${PROBE_TOKEN}"

cleanup_probe() {
    "${BASE_COMPOSE[@]}" exec -T nginx rm -f "$PROBE_FILE" >/dev/null 2>&1 || true
}
trap cleanup_probe EXIT

echo "[*] Creating ACME challenge probe inside nginx container..."
"${BASE_COMPOSE[@]}" exec -T nginx mkdir -p "$PROBE_DIR"
"${BASE_COMPOSE[@]}" exec -T nginx sh -c "printf '%s' '$PROBE_TOKEN' > '$PROBE_FILE'"

echo "[*] Verifying public HTTP-01 reachability for dreamcarhouse.com and www.dreamcarhouse.com..."
for host in "dreamcarhouse.com" "www.dreamcarhouse.com"; do
    RESP="$(curl -fsS --max-time 10 "http://${host}/.well-known/acme-challenge/${PROBE_TOKEN}" 2>/dev/null || true)"
    if [ "$RESP" != "$PROBE_TOKEN" ]; then
        echo "[ERROR] Public HTTP-01 check failed for http://${host}/.well-known/acme-challenge/${PROBE_TOKEN}" >&2
        echo "        Ensure DNS A record for ${host} has propagated to this server and port 80 is open." >&2
        exit 1
    fi
    echo "  [OK] http://${host}/.well-known/acme-challenge/ reachable"
done

cleanup_probe

echo "[*] Requesting Let's Encrypt certificate for dreamcarhouse.com and www.dreamcarhouse.com..."
"${COMPOSE[@]}" run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    -d dreamcarhouse.com \
    -d www.dreamcarhouse.com \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    --keep-until-expiring

echo "[*] Verifying certificate files inside nginx volume..."
"${BASE_COMPOSE[@]}" exec -T nginx test -s /etc/letsencrypt/live/dreamcarhouse.com/fullchain.pem
"${BASE_COMPOSE[@]}" exec -T nginx test -s /etc/letsencrypt/live/dreamcarhouse.com/privkey.pem

echo "[*] Switching nginx container to Let's Encrypt SSL configuration (ports 80 + 443)..."
export COMPOSE_PARALLEL_LIMIT=1
"${COMPOSE[@]}" up -d --wait nginx

echo "[*] Verifying local HTTPS health via nginx..."
for host in "dreamcarhouse.com" "www.dreamcarhouse.com"; do
    HTTPS_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -k --resolve "${host}:443:127.0.0.1" "https://${host}/" || echo "000")"
    echo "  HTTPS GET https://${host}/ -> HTTP ${HTTPS_CODE}"
    if [ -z "$HTTPS_CODE" ] || [ "$HTTPS_CODE" = "000" ] || [ "$HTTPS_CODE" -ge 400 ]; then
        echo "[ERROR] HTTPS smoke check returned ${HTTPS_CODE} for ${host}!" >&2
        exit 1
    fi
done

echo "=========================================================="
echo "  Let's Encrypt SSL Active for dreamcarhouse.com & www!"
echo "=========================================================="
echo "Next steps:"
echo "  1. Ensure .env.production has:"
echo "       ENABLE_SSL=letsencrypt"
echo "       JTRO_SSL_ENABLED=True"
echo "       DASHBOARD_COOKIE_SECURE=true"
echo "  2. Run: sudo bash scripts/update.sh --letsencrypt"
echo "  3. Add renewal cron in root crontab (sudo crontab -e):"
echo "       15 4 * * * /bin/bash /home/deploy/dream-car-house/scripts/renew_letsencrypt.sh >> /home/deploy/backups/ssl-renew.log 2>&1"
