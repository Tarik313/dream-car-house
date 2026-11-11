#!/bin/bash
set -euo pipefail

# One-command safe server update script
# Expected invocation:
#   sudo bash scripts/update.sh
#   sudo bash scripts/update.sh --ssl

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_DIR"

echo "=========================================================="
echo "  DREAM CAR HOUSE - Safe Zero-Drift Server Update         "
echo "=========================================================="
echo "[*] Repository directory: $REPO_DIR"

# Run git as the non-root repo owner when invoked via sudo to avoid dubious-ownership / root-owned .git files
if [ "$(id -u)" -eq 0 ] && [ -n "${SUDO_USER:-}" ] && [ "${SUDO_USER}" != "root" ]; then
    git_run() { sudo -u "$SUDO_USER" git "$@"; }
else
    git_run() { git "$@"; }
fi

# 1. Validate .env.production
if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production is missing in $REPO_DIR!" >&2
    exit 1
fi

REQUIRED_VARS=(
    "POSTGRES_DB"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "SECRET_KEY"
    "ALLOWED_HOSTS"
    "CORS_ALLOWED_ORIGINS"
    "CSRF_TRUSTED_ORIGINS"
    "NEXT_PUBLIC_BASE_URL"
    "PUBLIC_BASE_URL"
)

set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

for var in "${REQUIRED_VARS[@]}"; do
    val="${!var:-}"
    if [ -z "$val" ] || [[ "$val" == *"CHANGE_ME"* ]]; then
        echo "[ERROR] Required variable '$var' is missing or still set to CHANGE_ME in .env.production." >&2
        exit 1
    fi
done

if [ -z "${REVALIDATE_SECRET:-}" ] || [[ "${REVALIDATE_SECRET}" == *"CHANGE_ME"* ]]; then
    echo "[WARN] REVALIDATE_SECRET is unset or placeholder; on-demand ISR webhook purge will be disabled (60s/300s time-based ISR still active)."
fi

# 2. Compose files (HTTP first-boot vs Cloudflare SSL vs Let's Encrypt SSL)
COMPOSE_FILES=("-f" "docker-compose.yml")
SSL_MODE=false
if [ "${1:-}" = "--letsencrypt" ] || [ "${ENABLE_SSL:-false}" = "letsencrypt" ]; then
    echo "[*] Activating Let's Encrypt SSL override (docker-compose.letsencrypt.yml)..."
    COMPOSE_FILES+=("-f" "docker-compose.letsencrypt.yml")
    SSL_MODE=true
elif [ "${ENABLE_SSL:-false}" = "true" ] || [ "${1:-}" = "--ssl" ]; then
    if [ -f "/etc/ssl/cloudflare/cert.pem" ] && [ -f "/etc/ssl/cloudflare/key.pem" ]; then
        echo "[*] Activating Cloudflare SSL override (docker-compose.ssl.yml)..."
        COMPOSE_FILES+=("-f" "docker-compose.ssl.yml")
        SSL_MODE=true
    else
        echo "[ERROR] SSL mode requested, but /etc/ssl/cloudflare/{cert,key}.pem were not found!" >&2
        exit 1
    fi
fi

# 3. Record commit before pull and update code safely
BEFORE_COMMIT="$(git_run rev-parse --short HEAD)"
BEFORE_BRANCH="$(git_run rev-parse --abbrev-ref HEAD)"
echo "[*] Current branch/commit: $BEFORE_BRANCH ($BEFORE_COMMIT)"
echo "[*] Pulling latest changes with git pull --ff-only..."
git_run pull --ff-only
AFTER_COMMIT="$(git_run rev-parse --short HEAD)"
echo "[*] Updated commit: $BEFORE_BRANCH ($AFTER_COMMIT)"

# 4. Build and recreate containers sequentially to protect server memory
export COMPOSE_PARALLEL_LIMIT=1
echo "[*] Building and updating containers (COMPOSE_PARALLEL_LIMIT=1)..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" up -d --build --wait

# 5. Restart nginx to ensure upstream DNS caches reflect newly recreated container IPs
echo "[*] Restarting nginx to refresh upstream container DNS..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" restart nginx

# 6. Check database migrations without running migrate or makemigrations
echo "[*] Verifying no unapplied Django migrations remain..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" exec -T backend python manage.py migrate --check

# 7. Show container status
echo ""
echo "[*] Container Status:"
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" ps

# 8. Smoke test public & dashboard endpoints via nginx with timing
echo ""
echo "[*] Running nginx smoke checks (Host: dreamcarhouse.com)..."
ENDPOINTS=("/" "/cars/" "/sitemap.xml" "/admin/login/" "/login")
FAILURES=0

for path in "${ENDPOINTS[@]}"; do
    if [ "$SSL_MODE" = true ]; then
        STATS="$(curl -sS -o /dev/null -w "code=%{http_code} connect=%{time_connect}s ttfb=%{time_starttransfer}s total=%{time_total}s" \
            -k --resolve "dreamcarhouse.com:443:127.0.0.1" "https://dreamcarhouse.com${path}" || echo "code=000 connect=0s ttfb=0s total=0s")"
    else
        STATS="$(curl -sS -o /dev/null -w "code=%{http_code} connect=%{time_connect}s ttfb=%{time_starttransfer}s total=%{time_total}s" \
            -H "Host: dreamcarhouse.com" "http://127.0.0.1${path}" || echo "code=000 connect=0s ttfb=0s total=0s")"
    fi

    HTTP_CODE="$(echo "$STATS" | sed -n 's/.*code=\([0-9]*\).*/\1/p')"
    echo "  GET ${path} -> ${STATS}"
    if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" -ge 400 ]; then
        FAILURES=$((FAILURES + 1))
    fi
done

# Also verify unauthenticated /workspace returns 307 redirect cleanly
if [ "$SSL_MODE" = true ]; then
    WS_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -k --resolve "dreamcarhouse.com:443:127.0.0.1" "https://dreamcarhouse.com/workspace" || echo "000")"
else
    WS_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -H "Host: dreamcarhouse.com" "http://127.0.0.1/workspace" || echo "000")"
fi
echo "  GET /workspace (unauth) -> code=${WS_CODE} (expected 307)"
if [ "$WS_CODE" != "307" ]; then
    FAILURES=$((FAILURES + 1))
fi

if [ "$FAILURES" -gt 0 ]; then
    echo "[ERROR] Update completed, but $FAILURES smoke check(s) failed!" >&2
    exit 1
fi

echo "=========================================================="
echo "  Update complete ($BEFORE_COMMIT -> $AFTER_COMMIT) - All checks OK!"
echo "=========================================================="

