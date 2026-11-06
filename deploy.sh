#!/bin/bash
set -e

echo "=========================================================="
echo "  DREAM CAR HOUSE - 1-Click Production Docker Deployment  "
echo "=========================================================="

# 1. Environment Setup
if [ ! -f .env.production ]; then
    echo "[!] .env.production not found. Copying from .env.production.example..."
    cp .env.production.example .env.production
    echo "[*] Created .env.production. Please update your secret keys if needed."
fi

# 2. Build and Start Full Container Suite (Postgres, Redis, Backend, Celery, Frontend, Nginx)
echo "[*] Building and spinning up containers..."
docker compose --env-file .env.production up -d --build

# 3. Wait for database and backend readiness
echo "[*] Waiting for services to initialize..."
sleep 10

# 4. Run Database Migrations
echo "[*] Executing database migrations..."
docker compose exec backend python manage.py migrate --noinput

# 5. Collect Static Assets
echo "[*] Collecting Django static assets..."
docker compose exec backend python manage.py collectstatic --noinput

# 6. Verify Container Status
echo "=========================================================="
echo "  All Services Successfully Deployed! Status Summary:    "
echo "=========================================================="
docker compose ps

echo ""
echo "Next Steps:"
echo "1. Create initial superuser (if first time):"
echo "   docker compose exec backend python manage.py createsuperuser"
echo "2. Visit https://your-domain.com in your browser."
echo "3. Visit https://your-domain.com/admin/ for Django Admin."
