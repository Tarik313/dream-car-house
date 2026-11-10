#!/bin/bash
set -euo pipefail

echo "=========================================================="
echo "  DREAM CAR HOUSE - Production Docker Deployment Engine   "
echo "=========================================================="

# 1. Environment Verification
if [ ! -f .env.production ]; then
    echo "[ERROR] .env.production is missing!"
    echo "Refusing to deploy. Please create .env.production with your real production secrets."
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

# Parse .env.production safely to validate required variables
set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

for var in "${REQUIRED_VARS[@]}"; do
    val="${!var:-}"
    if [ -z "$val" ] || [[ "$val" == *"CHANGE_ME"* ]]; then
        echo "[ERROR] Required variable '$var' is empty or still set to a placeholder (CHANGE_ME) in .env.production."
        echo "Please provide a valid production secret before deploying."
        exit 1
    fi
done

# 2. Limit concurrency during compilation to protect 8 GB VPS memory
export COMPOSE_PARALLEL_LIMIT=1

# 3. Determine Compose configuration (HTTP first-boot vs SSL override)
COMPOSE_FILES=("-f" "docker-compose.yml")

if [ "${ENABLE_SSL:-false}" = "true" ] || [ "${1:-}" = "--ssl" ]; then
    if [ -f "/etc/ssl/cloudflare/cert.pem" ] && [ -f "/etc/ssl/cloudflare/key.pem" ]; then
        echo "[*] Cloudflare SSL certificates verified. Activating SSL override (docker-compose.ssl.yml)..."
        COMPOSE_FILES+=("-f" "docker-compose.ssl.yml")
    else
        echo "[ERROR] SSL mode requested, but certificates were not found at /etc/ssl/cloudflare/cert.pem and key.pem on the host!" >&2
        echo "Please install Cloudflare certificates or run without --ssl for HTTP-only first boot." >&2
        exit 1
    fi
else
    echo "[*] Operating in HTTP-only first-boot mode (port 80). Run './deploy.sh --ssl' once SSL certificates are installed."
fi

# 4. Spin up services and wait for container healthchecks
echo "[*] Building and spinning up containers (single-task build limit active)..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" up -d --build --wait

# 5. Run Database Migrations
echo "[*] Executing database migrations..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" exec -T backend python manage.py migrate --noinput

# 6. Collect Static Assets
echo "[*] Collecting Django static assets..."
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" exec -T backend python manage.py collectstatic --noinput

# 7. Verify Service Status
echo "=========================================================="
echo "  All Services Successfully Deployed! Status Summary:    "
echo "=========================================================="
docker compose --env-file .env.production "${COMPOSE_FILES[@]}" ps

echo ""
echo "Next Steps:"
echo "1. Create initial superuser (if first time):"
echo "   docker compose --env-file .env.production exec backend python manage.py createsuperuser"
echo "2. Visit https://dreamcarhouse.com in your browser."
echo "3. Visit https://dreamcarhouse.com/workspace for Dashboard or /admin/ for Django Admin."
