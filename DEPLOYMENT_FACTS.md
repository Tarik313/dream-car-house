# DREAM CAR HOUSE - Comprehensive Production Deployment Facts

> **Document Classification:** Production Deployment Specification & System Audit  
> **Target Environment:** Linux VPS / Docker Compose Architecture  
> **Date Generated:** November 2026  
> **Security Notice:** This document strictly contains architecture specifications, paths, versions, and configuration blueprints. **Zero secrets, API keys, or raw credential strings are exposed.**

---

## 1. Project Overview & Folder Structure

### Repository & Version Control
- **Repository Path:** `D:\Antigravity Workspace\dream-car-house`
- **Remote Origin (SSH):** `git@github.com:Tarik313/dream-car-house.git`
- **Remote Origin (HTTPS):** `https://github.com/Tarik313/dream-car-house.git`
- **Active Production Branch:** `main`

### Core Subsystems & Folder Nomenclature
```
dream-car-house/
├── backend/                       # Django 6.0 + Django REST Framework API (Port 8000)
│   ├── apis/                      # Global API renderers & top-level routing
│   ├── app_libs/                  # Logging and helper utilities
│   ├── apps/
│   │   ├── home/                  # Showroom stories, hero sliders, VIP sanctuary, consultations
│   │   ├── inventory/             # Car inventory, brands, models, specifications, images
│   │   ├── seo_config/            # Dynamic per-page and category SEO metadata
│   │   └── dashboard_api/         # REST endpoints powering custom management workspace
│   ├── core/                      # Settings, WSGI/ASGI entrypoints, Celery, middlewares
│   ├── GeoLite2City/              # Bundled MaxMind offline IP geolocation database
│   ├── media_root/media/          # Local media uploads storage (persistent volume)
│   ├── static_root/static/        # Collected static assets
│   ├── Dockerfile                 # Python 3.12-slim production container definition
│   └── requirements.txt           # Python dependency manifest
├── frontend/                      # Next.js 16 Luxury Customer Web Application (Port 3000)
│   ├── app/                       # App Router pages (SSR & dynamic routes)
│   ├── components/                # React UI components (Hero, CarCard, Navbar, Filters)
│   ├── lib/                       # API clients, showroom data, utilities
│   ├── public/                    # Static assets, logos, local hero video, icons
│   ├── Dockerfile                 # Multi-stage Node 20-alpine SSR container definition
│   └── package.json               # Frontend dependency manifest
├── dashboard/                     # Next.js 16 Standalone Custom Workspace (Port 3100)
│   ├── app/                       # Workspace & authentication routes
│   ├── components/                # Admin panels, car inventory editors, lead view tables
│   ├── lib/                       # Server actions, authentication transports, data handlers
│   ├── scripts/                   # Standalone distribution prep scripts
│   ├── Dockerfile                 # Multi-stage Node 22-bookworm standalone container definition
│   └── package.json               # Dashboard dependency manifest
├── nginx/                         # Reverse proxy configuration
│   ├── production.conf            # Multi-service SSL & caching reverse proxy configuration
│   └── begautos.conf              # Legacy fallback configuration
├── docs/                          # Architecture diagrams, specifications, migration docs
├── research/                      # Brand audit reports and SEO studies
├── scratch/                       # Verification scripts and automation tests
├── docker-compose.yml             # Full 7-service production container orchestration
├── deploy.sh                      # 1-click automated Docker deployment script
├── .env.production.example        # Production environment variable reference blueprint
└── Command_after_VPS_Deployment.txt # Manual VPS operational checklist
```

---

## 2. Runtime Environments & Dependency Versions

| Component | Technology | Version / Specification | Environment / Container |
|---|---|---|---|
| **Python** | CPython | `3.12.10` | `python:3.12-slim` |
| **Django** | Django Web Framework | `6.0` | Backend Container (`dch_backend`) |
| **DRF** | Django REST Framework | `3.16.1` | Backend Container (`dch_backend`) |
| **Node.js** | Node.js Runtime | `v26.13.0` (Host) / `v20.x` & `v22.x` (Docker) | `node:20-alpine` (FE), `node:22-bookworm` (DB) |
| **Package Manager** | npm | `11.20.0` | Host & Container Environments |
| **Frontend Framework** | Next.js / React | Next.js `16.1.6`, React `19.2.3`, React DOM `19.2.3` | Frontend Container (`dch_frontend`) |
| **Dashboard Framework** | Next.js / React | Next.js `16.4.1`, React `19.3.1`, React DOM `19.3.1` | Dashboard Container (`dch_custom_dashboard`) |
| **Database** | PostgreSQL | `16-alpine` | Database Container (`dch_postgres`) |
| **In-Memory Cache / Broker** | Redis | `7-alpine` (512MB maxmemory, `allkeys-lru`) | Redis Container (`dch_redis`) |
| **Asynchronous Worker** | Celery | `5.x` | Celery Worker Container (`dch_celery`) |
| **Reverse Proxy** | Nginx | `nginx:alpine` | Proxy Container (`dch_nginx`) |

---

## 3. Backend Architecture & Django Configuration

### Settings & Entrypoints
- **Production Settings Module:** `core.settings.production`
- **Development Settings Module:** `core.settings.dev`
- **Base Settings Module:** `core.settings.base`
- **WSGI Application:** `core.wsgi:application` (Bound via Gunicorn with 4 workers, 2 threads)
- **ASGI Application:** `core.asgi:application`
- **Celery App:** `core.celery:app` (Worker: `celery -A core worker -l info --concurrency=2`)
- **Root URL Configuration:** `core.urls`

### Installed Applications
- **Django Core & Admin:**
  - `jazzmin` (Custom administrative UI theme)
  - `django.contrib.admin`
  - `django.contrib.auth`
  - `django.contrib.contenttypes`
  - `django.contrib.sessions`
  - `django.contrib.messages`
  - `django.contrib.staticfiles`
- **Local Business Applications:**
  - `apps.home` (Hero sliders, site settings, showroom branches, stories, testimonials, consults)
  - `apps.inventory` (Vehicle catalog, brands, model generations, body styles, car photos, stock)
  - `apps.seo_config` (Dynamic SEO metadata engine for pages and category listings)
  - `apps.dashboard_api` (Secure REST APIs serving the custom Next.js workspace dashboard)
- **Third-Party Integrations:**
  - `corsheaders` (Cross-Origin Resource Sharing control)
  - `rest_framework` (RESTful API framework)
  - `rest_framework_simplejwt` (JSON Web Token authentication)
  - `django_filters` (QuerySet parameter filtering)
  - `fontawesomefree` (Administrative icon sets)
  - `django_countries` (Country code lookups)
  - `tinymce` (Rich text editing for vehicle features and company profiles)
  - `csp` (Content Security Policy headers)

### Network Security & Host Allowances
- **`ALLOWED_HOSTS`:**
  - Configured in production: `localhost`, `127.0.0.1`, `dreamcarhouse.com`, `www.dreamcarhouse.com`
- **`CORS_ALLOWED_ORIGINS`:**
  - `https://dreamcarhouse.com`
  - `https://www.dreamcarhouse.com`
  - `http://localhost:3000` (Local frontend development)
  - `http://localhost:3100` (Local dashboard development)
- **`CSRF_TRUSTED_ORIGINS`:**
  - `https://dreamcarhouse.com`
  - `https://www.dreamcarhouse.com`
  - `https://author.dreamcarhouse.com` (Legacy author domain)

### Static & Media Paths
- **`STATIC_URL`:** `/static/`
- **`STATIC_ROOT`:** `backend/static_root/static` (Persisted via Docker volume `static_volume:/app/static_root` and mounted at `/var/www/static` in Nginx)
- **`STATICFILES_STORAGE`:** `whitenoise.storage.CompressedManifestStaticFilesStorage` in production
- **`MEDIA_URL`:** `/media/`
- **`MEDIA_ROOT`:** `backend/media_root/media` (Persisted via Docker volume `media_volume:/app/media` and mounted at `/var/www/media` in Nginx)

### Required Deployment Commands
```bash
# 1. Apply database migrations
python manage.py migrate --noinput

# 2. Collect static files for Nginx / WhiteNoise
python manage.py collectstatic --noinput

# 3. Create administrative superuser (First-time setup)
python manage.py createsuperuser

# 4. Mandatory Seed Commands (Execute in order if initializing a fresh database):
python manage.py seed_site_settings         # Populates showroom hours, contact phone/emails, address
python manage.py seed_hero_slider           # Sets up day/night showroom hero images and video
python manage.py seed_runway_brands         # Seeds luxury automobile brands (Mercedes, BMW, BYD, Porsche)
python manage.py seed_showroom_inventory    # Seeds real showroom car fleet
python manage.py seed_seo_configs           # Populates static and category SEO title/meta defaults
python manage.py seed_chronicles_sanctuary  # Populates VIP Sanctuary & Visual Chronicles
python manage.py seed_consult_experience    # Populates bespoke consultation pillars
```

---

## 4. Database Architecture & Models

### Engines
- **Production Database:** PostgreSQL 16 (`django.db.backends.postgresql`), containerized as `dch_postgres`
- **Local Development Database:** SQLite 3 (`backend/db.sqlite3`)

### Data Models by Application

#### `apps.home`
- **`SiteSetting`:** Global business settings, official email, phone numbers, Kakrail & Gulshan operating hours, social links, trade license number.
- **`Slider`:** Homepage hero configuration supporting dynamic Day/Night showroom imagery fallback (`dch-day-showroom.webp` / `dch-night-showroom.webp`), title, subtitle, and MP4/external video stream.
- **`About`, `AboutCompanyProfile`, `AboutFeature`:** Brand philosophy, luxury heritage, showroom features.
- **`ShowroomBranch`:** Physical locations (Kakrail & Gulshan 2), address lines, phone numbers, Google Maps GPS coordinates.
- **`VIPSanctuary`, `VIPSanctuaryFeature`:** Luxury lounge highlights and bespoke buying perks.
- **`VisualChronicle`, `VisualChronicleImage`:** Curated car photo gallery collections.
- **`ExperienceSection`:** Customer journey pillars (Consultation, Test Drive, White-Glove Handover).
- **`Consultation`:** VIP consultation bookings and private viewing appointment requests.
- **`ContactMessage`:** General inquiry contact form submissions.
- **`SellCarRequest` & `SellYourCarsImage`:** Luxury vehicle trade-in and sell requests with multi-photo customer uploads.
- **`BuyerPreference`:** Homepage quick filter badges (e.g., Luxury SUV, Hybrid, Electric).
- **`ShowroomStory`:** Ephemeral 24-hour visual showroom stories.
- **`PeopleTalkAboutUs`:** Verified customer reviews and press testimonials.
- **`SalesRepresentative`:** Senior brand specialists and sales concierge contact cards.
- **`Subscriber`:** Newsletter subscriptions.
- **`IdempotencyKey`:** Cryptographic request tokens to prevent duplicate form submissions.

#### `apps.inventory`
- **`Brand`:** Luxury automotive manufacturers (Mercedes-Benz, BMW, BYD, Porsche, Rolls-Royce, Range Rover, Audi, Lexus, Bentley, Lamborghini) with logos and SEO slugs.
- **`ModelGeneration`:** Model series classifications.
- **`BodyStyle`:** SUV, Sedan, Coupe, Convertible, Electric.
- **`Inventory`:** Master vehicle catalog tracking VIN, price, condition (Brand New, Pre-Owned, Reconditioned), registration year, mileage, engine capacity, fuel type, transmission, exterior/interior colors, EV battery specs, feature flags, published status.
- **`InventoryImage` (`CarImage`):** Multi-angle photo catalog with display order priority and photo perspective tags (`EXTERIOR`, `COCKPIT`, `INTERIOR`, `PROFILE`, `WHEELS`, `REAR`).
- **`Stock`:** Live vehicle status (Available, Booked, In Transit, Sold).
- **`InventoryQuote`:** Vehicle-specific price inquiry and reservation leads.

#### `apps.seo_config`
- **`SEOConfig`:** Page-level SEO metadata (Title, description, canonical URL, OG tags, Twitter cards, robots directives, visibility) for static routes (`home`, `gallery`, `about`, `sell`, `byd-cars`, `contact`).
- **`CategoryPageSEO`:** SEO configurations for dynamic vehicle category filters (`brand-new`, `pre-owned`, `reconditioned`, `brands`).

### Local Data Migration Strategy (SQLite to PostgreSQL)
To migrate existing showroom inventory from local development to production PostgreSQL:
```bash
# Step 1: Export local data excluding permission and content type caches
python manage.py dumpdata --natural-foreign --natural-primary \
  -e contenttypes -e auth.Permission --indent 2 > local_database_dump.json

# Step 2: In production environment after applying schema migrations
python manage.py migrate --run-syncdb
python manage.py loaddata local_database_dump.json
```

---

## 5. Media Asset Pipeline & Storage Specifications

### Storage Paths & Organization
- **Base Storage Root:** `backend/media_root/media`
- **Dynamic File Hierarchy:**
  - Vehicle Images: `images/YYYY-MM-DD/<filename>-<timestamp>.<ext>`
  - Ephemeral Stories: `stories/YYYY-MM-DD/<filename>-<timestamp>.<ext>`
- **Persistent Production Mount:** Docker named volume `media_volume` mapped to `/var/www/media` in Nginx.

### Formats & Optimization
- **Allowed Extensions:** `.jpg`, `.jpeg`, `.png`, `.webp` (Enforced via Django `FileExtensionValidator`).
- **Target Compression Format:** WebP format preferred for fast loading and low bandwidth.
- **Next.js Image Handling:** Configured with `images: { unoptimized: true }` in `frontend/next.config.ts`, passing image delivery to Nginx with aggressive caching headers.

### Upload Limits
- **Nginx Reverse Proxy Limit:** `client_max_body_size 50M;` (Allows bulk multi-photo vehicle uploads).
- **Django Memory Threshold:** `DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600` (100 MB).

### Current Media Footprint
- **Total Media Assets on Disk:** 191 files
- **Total Media Directory Size:** `29,938,517 bytes` (~28.55 MB / ~29.94 MB)

---

## 6. Frontend & Dashboard Web Applications

### 1. Consumer Showroom Frontend (`frontend/`)
- **Technology:** Next.js 16.1.6 (App Router with Turbopack), React 19.2.3, Tailwind CSS v4.
- **Build Command:** `npm run build` (`next build`)
- **Start Command:** `npm run start` (`next start`)
- **Container Port:** `3000` (Bound internally to Nginx upstream `frontend:3000`)
- **Backend API Origin Resolution:** Evaluated dynamically via `INTERNAL_BACKEND_URL` -> `NEXT_PUBLIC_BASE_URL` -> `BACKEND_API_ORIGIN` (Fallback: `http://127.0.0.1:8000`).
- **Trailing Slash:** `trailingSlash: true` (Matches Django canonical URL conventions).
- **API Rewrites (`next.config.ts`):**
  - `/api/v1/:path*` -> `${origin}/api/v1/:path*`
  - `/media/:path*` -> `${origin}/media/:path*`
- **Route Compilation Summary:**
  - **Static Pages (○):** `/robots.txt`
  - **Server-Rendered on Demand (ƒ):**
    - `/` (Luxury Showroom Homepage with Day/Night Hero)
    - `/about` (Heritage & Showroom Pillars)
    - `/byd-cars` (Electric Vehicle Showcase)
    - `/cars` & `/inventory` (Inventory Explorer)
    - `/cars/[slug]` & `/car-details/[id]` (Vehicle Specification & Gallery)
    - `/cars/brand` & `/cars/brand/[brandSlug]` (Manufacturer Showcases)
    - `/cars/brand-new`, `/cars/pre-owned`, `/cars/reconditioned` (Condition Filter Collections)
    - `/gallery` (Curated Showroom Chronicles)
    - `/sell` (Vehicle Valuation Request Portal)
    - `/contact` (Location Info, Operating Hours & Inquiries)
    - `/sitemap.xml` (Real-Time XML Sitemap Engine)
- **Robots & Sitemap Generation:**
  - `robots.txt`: Directs search engine crawlers, disallows `/api/`, specifies `https://dreamcarhouse.com/sitemap.xml`.
  - `sitemap.xml`: Dynamically queries active inventory, registered brands, and SEO configurations, respecting `HIDDEN` and `noindex` directives.

### 2. Custom Workspace Dashboard (`dashboard/`)
- **Technology:** Next.js 16.4.1 (App Router), React 19.3.1, Lucide React, Tailwind CSS.
- **Output Mode:** Standalone deployment (`output: "standalone"`).
- **Build Command:** `npm run build` (`next build && node scripts/prepare-standalone.mjs`).
- **Start Command:** `npm run start` (`node server.js`).
- **Container Port:** `3100` (Local dev `3001`, bound in production to Nginx upstream `dashboard:3100`).
- **Backend API Origin Resolution:** Evaluates `DASHBOARD_API_ORIGIN` (Fallback: `http://127.0.0.1:8000`).
- **Security Headers:** Enforces `X-Robots-Tag: noindex, nofollow, noarchive` across all routes.
- **Routes Managed:**
  - `/login`: Secure administrative authentication.
  - `/workspace`: Real-time inventory and lead overview metrics.
  - `/workspace/cars`, `/workspace/cars/new`, `/workspace/cars/[id]/edit`: Comprehensive vehicle fleet manager.
  - `/workspace/brands`: Brand catalogue & logo controller.
  - `/workspace/media`: Showroom photo asset manager.
  - `/workspace/leads`, `/workspace/contact-submissions`, `/workspace/car-sales`: Inbound inquiry CRM.
  - `/workspace/slider`: Hero day/night image and video controller.
  - `/workspace/about-us`: Company profile and feature editor.
  - `/workspace/settings`, `/workspace/settings/social-links`, `/workspace/settings/seo`: Platform configuration.

---

## 7. Environment Variables Reference

> **Security Rule:** ONLY variable names and their functional architectural purposes are listed. No secrets or credential values are shown.

### Database & In-Memory Services
| Variable Name | Component | Stage | Purpose |
|---|---|---|---|
| `POSTGRES_DB` | PostgreSQL | Run-time | Database name for PostgreSQL service |
| `POSTGRES_USER` | PostgreSQL | Run-time | Database superuser/role username |
| `POSTGRES_PASSWORD` | PostgreSQL | Run-time | Secret password for database user |
| `DATABASE_URL` | Backend / Celery | Run-time | Complete PostgreSQL connection URI string |
| `REDIS_URL` | Backend / Cache | Run-time | In-memory cache connection URI (`redis://redis:6379/1`) |
| `CELERY_BROKER_URL` | Celery Worker | Run-time | Redis message broker URI for asynchronous queues |
| `CELERY_RESULT_BACKEND`| Celery Worker | Run-time | Redis result storage URI for completed jobs |

### Django Backend Configuration
| Variable Name | Component | Stage | Purpose |
|---|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Backend | Run-time | Active Django settings file path (`core.settings.production`) |
| `SECRET_KEY` / `JTRO_SECRET_KEY` | Backend | Run-time | Cryptographic salt key for session cookies, CSRF, and JWT signing |
| `JTRO_DEBUG` | Backend | Run-time | Debug mode flag; must evaluate to `'False'` in production |
| `ALLOWED_HOSTS` / `JTRO_ALLOWED_HOSTS` | Backend | Run-time | Comma-delimited list of trusted HTTP `Host` header domains |
| `CORS_ALLOWED_ORIGINS` | Backend | Run-time | Trusted client origins permitted for Cross-Origin requests |
| `CSRF_TRUSTED_ORIGINS` | Backend | Run-time | Trusted origins permitted to submit unsafe HTTP operations |
| `JTRO_SSL_ENABLED` | Backend | Run-time | Enables `SECURE_PROXY_SSL_HEADER` for upstream HTTPS reverse proxy |
| `JTRO_DB_ENGINE` | Backend | Run-time | Database backend class (`django.db.backends.postgresql`) |
| `JTRO_DB_NAME` | Backend | Run-time | Database name parsed by `production.py` |
| `JTRO_DB_USER` | Backend | Run-time | Database user parsed by `production.py` |
| `JTRO_DB_PASSWORD` | Backend | Run-time | Database password parsed by `production.py` |
| `JTRO_DB_HOST` | Backend | Run-time | Database host name (`postgres` or `127.0.0.1`) |
| `JTRO_DB_PORT` | Backend | Run-time | Database network port (`5432`) |
| `TRUSTED_PROXY_IPS` | Backend | Run-time | Comma-delimited trusted reverse proxy IP addresses for client IP detection |
| `NUM_PROXIES` | Backend | Run-time | Number of proxies ahead of the Django application |
| `USE_X_FORWARDED_FOR` | Backend | Run-time | Boolean flag enabling client IP parsing from `X-Forwarded-For` |
| `GEOIP_PATH` | Backend | Run-time | File path to local MaxMind GeoLite2 directory |
| `REVALIDATE_SECRET` | Backend | Run-time | Shared secret token authorizing on-demand Next.js ISR revalidation |

### Frontend & Dashboard
| Variable Name | Component | Stage | Purpose |
|---|---|---|---|
| `NODE_ENV` | Frontend & Dashboard | Build / Run | Node environment mode (`production`) |
| `PORT` | Frontend & Dashboard | Run-time | Port on which the HTTP server listens (`3000` / `3100`) |
| `INTERNAL_BACKEND_URL` | Frontend & Dashboard | Run-time | Internal Docker container network URL to Django API (`http://backend:8000`) |
| `NEXT_PUBLIC_BASE_URL` | Frontend | Build / Run | Public canonical domain URL (`https://dreamcarhouse.com`) |
| `BACKEND_API_ORIGIN` | Frontend | Run-time | Fallback public backend origin for SSR data fetching |
| `DASHBOARD_API_ORIGIN` | Dashboard | Run-time | Backend API origin accessed by dashboard server-actions |
| `NEXT_TELEMETRY_DISABLED`| Frontend & Dashboard | Build / Run | Disables anonymous Next.js build analytics |

---

## 8. Third-Party Integrations & External Services

- **Email / SMTP:** Currently not bound to third-party transactional mail providers (SendGrid/SES). Inbound leads (`ContactMessage`, `Consultation`, `SellCarRequest`) persist to PostgreSQL and are processed in the Workspace CRM.
- **Analytics & Tracking:** Clean architecture without third-party tracking scripts loaded by default, ensuring 100% Core Web Vitals compliance. Site settings contain database fields for Facebook Pixel and Google Tag Manager IDs.
- **Maps & Navigation:** Zero-cost Google Maps iframe embeds configured for Kakrail and Gulshan showrooms (`output=embed`). No paid Google Maps JavaScript API key required.
- **Geolocation:** Bundled offline MaxMind GeoLite2 City database (`GeoLite2City.mmdb`, ~68MB) in `backend/GeoLite2City/`. Resolves visitor location without external API latency.
- **Video Delivery:** Native HTML5 video streaming for showroom hero (`/videos/hero-bg.mp4`) with support for embedded YouTube and Vimeo car tour links.
- **Bot Protection & Spam Prevention:** In-house cryptographic idempotency tokens (`IdempotencyKey`) and honeypot validation; eliminates reliance on invasive third-party captchas.
- **Storage Backend:** High-performance local SSD persistent volumes (`media_volume` and `static_volume`) served through Nginx. No external AWS S3 or Cloudinary dependency.
- **SSL / TLS Termination:** Automated Let's Encrypt Certbot via Nginx HTTP-01 challenge (`/.well-known/acme-challenge/`).

---

## 9. Domain & Routing Topology

### Domain Expectations
- **Primary Domain:** `https://dreamcarhouse.com`
- **Secondary Domain:** `https://www.dreamcarhouse.com`
- **Legacy Allowed Origin:** `https://author.dreamcarhouse.com`

### Nginx Routing Scheme
```
Client Request
      │
      ▼
Nginx Reverse Proxy (Port 80/443)
      ├── /static/           ──> Static Volume Mount (/var/www/static/) [Cached 30 Days]
      ├── /media/            ──> Media Volume Mount (/var/www/media/) [Cached 7 Days]
      ├── /api/              ──> Backend Gunicorn (http://backend:8000)
      ├── /admin/            ──> Backend Gunicorn (http://backend:8000)
      ├── /workspace         ──> Dashboard Next.js (http://dashboard:3100)
      ├── /login             ──> Dashboard Next.js (http://dashboard:3100)
      └── / (Default)        ──> Frontend Next.js (http://frontend:3000)
```

---

## 10. Known Issues, Hardcoded Values & Production Hardening Checklist

### 1. Inverted `DEBUG` Evaluation in `production.py`
- **Location:** `backend/core/settings/production.py` (Line 4)
- **Current Code:** `DEBUG = os.environ.get('JTRO_DEBUG') != 'False'`
- **Vulnerability:** If `JTRO_DEBUG` is unset or set to an empty string, `DEBUG` resolves to `True`, exposing Django debug screens in production.
- **Recommended Remediation:**
  ```python
  DEBUG = os.environ.get('JTRO_DEBUG', 'False').strip().lower() in ('true', '1')
  ```

### 2. Insecure Fallback `SECRET_KEY` in `base.py`
- **Location:** `backend/core/settings/base.py` (Line 16-17)
- **Current Code:** Line 16 is commented out; hardcoded `django-insecure-...` key is active.
- **Recommended Remediation:**
  ```python
  SECRET_KEY = os.environ.get("SECRET_KEY") or os.environ.get("JTRO_SECRET_KEY")
  if not SECRET_KEY:
      raise RuntimeError("SECRET_KEY environment variable is mandatory in production!")
  ```

### 3. Database Connection Variable Mismatch
- **Location:** `docker-compose.yml` vs `backend/core/settings/production.py`
- **Issue:** `docker-compose.yml` provides `DATABASE_URL`, whereas `production.py` parses individual `JTRO_DB_*` variables (`JTRO_DB_ENGINE`, `JTRO_DB_NAME`, etc.).
- **Recommended Remediation:** Configure `production.py` with `dj-database-url` (which is already installed in `requirements.txt`):
  ```python
  import dj_database_url
  DATABASES = {
      'default': dj_database_url.config(
          default=f"postgres://{os.environ.get('JTRO_DB_USER')}:{os.environ.get('JTRO_DB_PASSWORD')}@{os.environ.get('JTRO_DB_HOST', 'postgres')}:{os.environ.get('JTRO_DB_PORT', '5432')}/{os.environ.get('JTRO_DB_NAME')}",
          conn_max_age=600
      )
  }
  ```

### 4. Dashboard Environment Variable Mismatch
- **Location:** `docker-compose.yml` vs `dashboard/lib/server/auth.ts`
- **Issue:** `docker-compose.yml` sets `INTERNAL_BACKEND_URL`, but dashboard server actions specifically read `process.env.DASHBOARD_API_ORIGIN`. Without this, the container defaults to `http://127.0.0.1:8000` internally and cannot communicate with the backend.
- **Recommended Remediation:** Add `DASHBOARD_API_ORIGIN=http://backend:8000` to the dashboard service definition in `docker-compose.yml`.

### 5. Hardcoded Local IP Origins in Dashboard Next Config
- **Location:** `dashboard/next.config.ts` (Lines 5-22)
- **Issue:** `allowedDevOrigins` and `serverActions.allowedOrigins` contain hardcoded local IP addresses (`192.168.10.143`, `192.168.10.225`). Production domain requests for Server Actions may be rejected.
- **Recommended Remediation:** Include `dreamcarhouse.com` and `www.dreamcarhouse.com` in `allowedOrigins`.

### 6. Missing SSL Cookie Security Flags in Django
- **Location:** `backend/core/settings/production.py`
- **Issue:** Flags `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_SSL_REDIRECT`, and `SECURE_HSTS_SECONDS` are not enabled by default.
- **Recommended Remediation:** Add the following block to `production.py`:
  ```python
  if os.environ.get('JTRO_SSL_ENABLED') == 'True':
      SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
      SECURE_SSL_REDIRECT = True
      SESSION_COOKIE_SECURE = True
      CSRF_COOKIE_SECURE = True
      SECURE_HSTS_SECONDS = 31536000
      SECURE_HSTS_INCLUDE_SUBDOMAINS = True
      SECURE_HSTS_PRELOAD = True
  ```

### 7. Non-Existent Static Directory Entry
- **Location:** `backend/core/settings/base.py` (Line 200)
- **Issue:** `STATICFILES_DIRS` references `core/static`, which does not exist on disk, producing staticfiles warning `staticfiles.W004`.
- **Recommended Remediation:** Remove `os.path.join(PROJECT_DIR, "static")` from `STATICFILES_DIRS` or create an empty directory `backend/core/static`.

---

## 11. Automated Audit & Build Verification Outputs

### 1. Django Deployment Security Audit (`python manage.py check --deploy`)
```
Command: python manage.py check --deploy --settings=core.settings.production
Status: Checked with 7 Warning Issues (0 Critical Errors)

WARNINGS:
?: (security.W004) You have not set a value for the SECURE_HSTS_SECONDS setting.
?: (security.W008) Your SECURE_SSL_REDIRECT setting is not set to True.
?: (security.W009) Your SECRET_KEY has less than 50 characters, less than 5 unique characters, or it's prefixed with 'django-insecure-'.
?: (security.W012) SESSION_COOKIE_SECURE is not set to True.
?: (security.W016) CSRF_COOKIE_SECURE is not set to True.
?: (security.W018) You should not have DEBUG set to True in deployment.
?: (staticfiles.W004) The directory 'backend\core\static' in the STATICFILES_DIRS setting does not exist.
```

### 2. Frontend Build Verification (`npm run build` in `frontend/`)
```
Command: next build
Output: Next.js 16.1.6 (Turbopack)
Status: Compiled successfully in 6.3s (Exit Code: 0)
Routes Generated:
  ┌ ƒ /
  ├ ƒ /_not-found
  ├ ƒ /about
  ├ ƒ /byd-cars
  ├ ƒ /car-details/[id]
  ├ ƒ /cars
  ├ ƒ /cars/[slug]
  ├ ƒ /cars/brand
  ├ ƒ /cars/brand-new
  ├ ƒ /cars/brand/[brandSlug]
  ├ ƒ /cars/pre-owned
  ├ ƒ /cars/reconditioned
  ├ ƒ /contact
  ├ ƒ /gallery
  ├ ƒ /inventory
  ├ ○ /robots.txt
  ├ ƒ /sell
  └ ƒ /sitemap.xml
All pages compiled cleanly without TypeScript or packaging failures.
```

### 3. Dashboard Build Verification (`npm run build` in `dashboard/`)
```
Command: next build && node scripts/prepare-standalone.mjs
Output: Next.js 16.4.1 (Webpack, Standalone output)
Status: Compiled successfully in 5.8s (Exit Code: 0)
Routes Generated:
  ┌ ○ /
  ├ ○ /login
  ├ ○ /workspace
  ├ ○ /workspace/about-us
  ├ ○ /workspace/brands
  ├ ○ /workspace/car-sales
  ├ ○ /workspace/cars
  ├ ○ /workspace/cars/[id]/edit
  ├ ○ /workspace/cars/new
  ├ ○ /workspace/contact-submissions
  ├ ○ /workspace/leads
  ├ ○ /workspace/media
  ├ ○ /workspace/roles
  ├ ○ /workspace/settings
  ├ ○ /workspace/settings/seo
  ├ ○ /workspace/settings/social-links
  ├ ○ /workspace/slider
  └ ○ /workspace/users
Standalone bundle prepared at .next/standalone with server.js.
```

### 4. Python Package Security Audit (`pip-audit`)
```
Command: python -m pip_audit
Status: Tool not pre-installed in the virtual environment.
Remediation: Run `pip install pip-audit && pip-audit -r requirements.txt` on the deployment host.
```

### 5. Node Package Vulnerability Audits (`npm audit`)
- **Frontend Subsystem:**
  - Production Dependencies: **0 Vulnerabilities**
  - DevDependencies: 18 vulnerabilities (8 Moderate, 9 High, 1 Critical in `postcss-custom-properties` / `lodash` transitive toolchains). Does not affect client-side bundle security.
- **Dashboard Subsystem:**
  - Production Dependencies: **0 Vulnerabilities**
  - DevDependencies: 7 vulnerabilities (7 Moderate in `eslint` / `typescript-eslint` transitive development parser modules). Zero runtime vulnerabilities in production `standalone` mode.
