# Dashboard architecture

## Scope and isolation

Audit baseline: `fd8d42d`, clean working tree, origin `TahamidurTaief/Dream_Car_House-Full_Stack`. The checkout directory has a different name, but its remote matches. No AGENTS.md exists in this checkout or its applicable ancestors; the sibling non-Git folder's AGENTS.md does not govern this repository.

`dashboard/` is an independent Next.js App Router application with strict TypeScript, its own npm lockfile, CSS, environment example, Docker context and deployment lifecycle. It imports nothing from `frontend/`. The existing public frontend, dependencies, SSR, metadata, sitemap, Django admin and business model code remain unchanged. The only edits to existing backend files are registering the app and including its URL namespace.

Use a dedicated dashboard origin, with `/` as the dashboard root. Do not put this app beneath the public `/dashboard` path without a separate basePath/assets/routing design. The existing Nginx config continues to serve public Next at 3000 and Django at 8000; no live proxy changes are made. Dashboard development uses loopback port 3100. Its Docker image exposes 3100, runs as `node`, and uses standalone output. Compose starts only the dashboard, never the public frontend or database.

## Runtime and compatibility

Pinned Next.js **16.4.1**, React/React DOM **19.3.1**. Official [October 14 security advisory](https://nextjs.org/blog/nextjs-security-update-october-14-2026) identifies 16.4.1 as patched Active LTS. Official [Next 16 compatibility guidance](https://nextjs.org/docs/app/guides/upgrading/version-16) and installed package metadata require Node >=20.9; this app chooses Node 22+ and Docker Node 22. React 19.3.1 satisfies the package's ^19 peer range. TypeScript is strict with unchecked index access enabled. ESLint runs separately because Next 16 build does not run lint. Installed Next documentation was checked for server/client boundaries and configuration. Public frontend versions were not upgraded.

## Boundaries

- Django owns persistence, validation, business rules, admin forms and signals. `apps.dashboard_api` has no models, migrations or duplicate tables.
- `/api/v1/dashboard/access/` is an intentionally closed access probe. Explicit empty authentication classes and an unconditional deny permission isolate it from permissive public API defaults. Staff and superusers are also denied. There is no setting that enables access.
- Next's server-only access policy always denies. `/workspace` renders only the locked state and never fetches business records. A 200 HTML locked screen is not successful authentication; the API returns 403. Business routes are absent, not placeholder CRUD.
- `lib/server/api.ts` is the application API entry point. It fails before transport until auth is implemented. The internal typed transport validates origin, requires credentials, sets a five-second deadline and no-store, rejects redirects and validates envelopes and decoded payloads. Raw response bodies/errors are not sent to the browser. No client fetch, hydration refetch, service credential, auth cookie forwarding or NEXT_PUBLIC secret exists.
- Future auth must bind a verified user session to each backend request. Authorize at each backend endpoint, not just the layout. Do not replace the locked policy with an environment-only enable flag. Review session/CSRF/origin strategy before implementing writes.
- One typed navigation registry supplies implemented destinations and breadcrumb labels. Pages remain Server Components; the shell's interactive sidebar/dialog and error retry are client components. Server page children passed through the shell remain server-rendered.

## Existing authentication and response behavior

Django admin uses the existing ModelBackend, SessionMiddleware, AuthenticationMiddleware and CSRF middleware. No custom user model is configured. DRF defaults list TokenAuthentication, SessionAuthentication and JWTAuthentication, but `rest_framework.authtoken` is not installed and no token issuance/refresh URLs were found. SimpleJWT expects the `JWT` header prefix, not an assumed Bearer scheme. Do not invent login routes or reuse a static credential. The existing settings contain permissive CORS/host configuration and source-level credential literals; values are not copied here and no live auth settings were changed. No .env files, production database, dumps, media or customer records were inspected.

Public APIs use a custom renderer and pagination; see API_CONTRACT.md. New management serializers must expose raw writable values and preserve model save behavior. The public serializers are not management write contracts.

## Inventory.save() audit: policy preserved

Source: `backend/apps/inventory/models/inventory_model.py`.

1. Existing row is fetched by PK to remember its slug and canonical URL.
2. For Sold, UNPUBLISHED, ARCHIVED or UNLISTED records, the indexing branch only rewrites values **other than** `index, follow` and `index, nofollow` to `noindex, nofollow`. Thus it does **not** downgrade either indexable value. Help text says those records are forced to noindex, and nearby comments conflict with one another. No policy change is made.
3. A blank slug is generated from year, brand, model, engine with literal `cc`, and color. Supplied slugs are also slugified and uniqueness-suffixed. A count-based lookup loop excludes the current PK; database uniqueness remains the final constraint under concurrency. Changing car details alone does not regenerate a nonblank slug.
4. `previous_slug` records the old slug only when changed **and the field is empty**. It is one retained value, not an unlimited history and not necessarily the most recent slug. Public fallback redirects only published records with matching previous_slug. The slug route precedes the int route, so numeric detail paths match the slug converter first; the intended legacy-ID route is shadowed. No public routing change is made.
5. Slug generation precedes trimming/uppercasing manually entered model_name. When model_name is absent, the FK's model string is copied afterward, without another uppercase pass. InventoryAdmin does not include model_name in its fieldsets despite the model/API having that field.
6. Blank meta title, description and featured-image alt are generated once, then preserved. Limits are 70, 500 and 200 respectively. Description appends literal `km` to mileage even if mileage already carries units. H1 and target keyword are not generated. schema_override is used by the public serializer, otherwise it builds JSON-LD.
7. Blank canonical becomes `https://www.begautos.com/cars/<slug>/`. On slug change, it refreshes only when the old stored canonical matches the old default or specific non-www/typo variants. Other custom canonicals are retained. The check uses the prior stored canonical, so a newly supplied custom canonical in the same save can be overwritten if the old canonical was a default.
8. `super().save(*args, **kwargs)` preserves Django save arguments: a future update_fields optimization must include computed fields or may leave in-memory side effects unsaved. Avoid bulk update paths that bypass save/signals unless explicitly reviewed.
9. post_save sends synchronous revalidation requests for the car, listings, home and sitemap, swallowing request errors. SEOConfig has similar signals; CategoryPageSEO and Brand have no matching revalidation receiver in inspected files. Do not trigger real saves during foundation testing.
10. InventoryImage.save auto-assigns max(order)+1 for new zero-order images and generates blank alt text from FK model details; it does not use the Inventory model_name fallback identically. Preserve ordering, media validators and parent permissions in the future image API.

## Search indexing

All dashboard responses receive `X-Robots-Tag: noindex, nofollow, noarchive`; root metadata emits the same directives. Dashboard robots.txt disallows all paths and declares no sitemap; no dashboard sitemap exists. The untouched public sitemap explicitly enumerates public routes and inventory/brand URLs, so it does not discover this separate application.

robots.txt is not access control and cannot by itself guarantee deindexing. A blocked crawler may not observe noindex directives. Authentication and per-request authorization protect records; search removal requires separate handling if URLs were already indexed. Do not add dashboard URLs to public sitemap generators or link discovery.
