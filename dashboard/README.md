# Beg Autos dashboard foundation

Independent Next.js application. Authentication and business modules are deliberately unavailable. `/workspace` always displays a locked state, including when a Django admin session exists.

From the repository root, with Node 22+:

```sh
cd dashboard
npm ci
npm run dev
```

Open http://127.0.0.1:3100. Port 3100 was checked free during implementation; recheck before starting locally. No environment file or backend is required to view the locked foundation. `.env.example` documents the future server-only backend origin; configuring it does not enable access. Leave the public frontend and existing backend processes running unchanged.

Production locally:

```sh
npm run build
npm start
```

`build` prepares standalone assets; `start` launches the standalone server on loopback 3100. Override `PORT` if needed. `HOSTNAME_OVERRIDE=0.0.0.0` explicitly binds all interfaces when desired. Docker uses its own HOSTNAME configuration.

Independent Docker build, from repository root:

```sh
docker build -t begautos-dashboard:local dashboard
docker run --rm -p 127.0.0.1:3100:3100 begautos-dashboard:local
```

Or from `dashboard/`: `docker compose up --build`. Compose starts only this app. No database, migrations or public frontend services are started. For a future backend connection, container loopback is not the host; compose maps host.docker.internal, while a deployed image needs a private backend origin supplied at runtime. Do not supply credentials as build arguments.

Checks from `dashboard/`:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Backend boundary tests from repository root (uses the existing backend virtual environment):

```sh
backend/.venv/bin/python backend/manage.py test apps.dashboard_api --settings=apps.dashboard_api.test_settings --verbosity=2
backend/.venv/bin/python docs/dashboard/audit_modules.py
```

These use isolated settings and never read the existing database or environment files. Use the project's existing dependency setup if `.venv` is absent; do not load production configuration just to run these checks.

Against an already running development backend that includes the new app:

```sh
curl -i http://127.0.0.1:8000/api/v1/dashboard/access/
```

Expect 403 with AUTH_NOT_CONFIGURED, even with existing admin credentials. Do not migrate or restart live services for this phase.

Handoff: [Architecture](../docs/dashboard/ARCHITECTURE.md), [Design system](../docs/dashboard/DESIGN_SYSTEM.md), [Module matrix](../docs/dashboard/MODULE_MATRIX.md), [API contract](../docs/dashboard/API_CONTRACT.md), [Progress](../docs/dashboard/PROGRESS.md).

Optional repeatable browser check (keep `npm start` running in another terminal; commands below run from `dashboard/`):

```sh
npm install --prefix /tmp/begautos-dashboard-browser playwright@1.64.1
PLAYWRIGHT_BROWSERS_PATH=/tmp/begautos-dashboard-browsers /tmp/begautos-dashboard-browser/node_modules/.bin/playwright install chromium
PLAYWRIGHT_MODULE=/tmp/begautos-dashboard-browser/node_modules/playwright/index.mjs PLAYWRIGHT_BROWSERS_PATH=/tmp/begautos-dashboard-browsers node tests/browser-smoke.mjs
```

The browser check verifies navigation widths, mobile focus handling, no data requests, locked screens, robots metadata/headers and absent sitemap/business routes. Screenshots are written to `/tmp/begautos-dashboard-*.png`; browser tooling stays outside application dependencies.
