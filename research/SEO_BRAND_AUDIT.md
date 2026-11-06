# BEG AUTOS — SEO & Brand Audit Report

## Issue 1 — Metadata Pipeline Audit

### Findings (per page)
- `/page.tsx` (Home): Has `generateMetadata()`, but fallbacks to hardcoded values when the SEO config fetch fails or returns null. The destructuring step assumes all keys exist (e.g., `SEO.title`).
- `/cars/page.tsx`: Does not implement dynamic `generateMetadata()`. Relies on global layout metadata which is generic ("Cars for Sale"). Missing specific collection SEO.
- `/cars/[slug]/page.tsx`: Implements `generateMetadata()`, fetches individual car data. However, if the car has no custom meta description, it does not reliably fall back to the car's general description, leaving the tag empty.
- `/about`, `/contact`: Missing `generateMetadata()`.

### Root Cause
Inconsistent application of Next.js `generateMetadata()` API across route segments. The API integration with the backend SEO module (e.g., `fetchSEOConfig`) lacks a robust fallback mechanism for partial field returns (e.g., when title exists but description is empty string).

### Files Involved (with exact paths)
- `frontend/app/page.tsx`
- `frontend/app/cars/page.tsx`
- `frontend/app/cars/[slug]/page.tsx`
- `frontend/lib/seo.ts` (API fetcher)

---

## Issue 2 — Metadata Conflict Audit

### Findings
The root `layout.tsx` defines a global `metadata` object. However, nested pages using `generateMetadata()` are returning partial objects (e.g., just `title`). Next.js recursively merges metadata, which causes OpenGraph and Twitter fields from the root to mismatched page titles, or incorrect `metadataBase` to be inherited. There are also instances where the backend returns `""` (empty string) instead of `null`, which overrides the parent layout's fallback with an empty string.

### Root Cause
Partial object returns in page-level `generateMetadata()` merging with global `layout.tsx` metadata. Empty strings from the Django backend API are not being handled as "missing" on the frontend, causing them to override valid fallback data.

### Files Involved (with exact paths)
- `frontend/app/layout.tsx`
- `frontend/app/cars/[slug]/page.tsx`
- `backend/apps/seo_config/serializers.py`

---

## Issue 3 — Brand Filter Sidebar Audit

### Findings (trace each step of pipeline)
1.  **Backend (`InventoryFilterView`)**: The endpoint `/api/v1/inventory/filters/` returns data wrapped in a success object: `{ "success": true, "data": { "brands": [...] } }`.
2.  **Frontend fetch (`inventoryFilters.ts`)**: The fetch call successfully retrieves the JSON, but does not unwrap the `data` wrapper.
3.  **Server/Client Component**: The server component passes the entire wrapper object as the `brands` prop instead of the array.
4.  **Client Component (`CarsClient.tsx`)**: Attempts to map over `brands`, treating it as an array. Since it receives an object `{ success: ..., data: ... }`, `.map()` is undefined or fails silently, rendering an empty dropdown.

### Exact Break Point
The API wrapper format (`success`/`data`) is not being destructured inside `inventoryFilters.ts` or the Server Component before passing the prop to `CarsClient.tsx`.

### Files Involved (with exact paths)
- `frontend/lib/inventoryFilters.ts`
- `frontend/app/cars/page.tsx`
- `frontend/app/components/CarsClient.tsx`
- `backend/apps/inventory/views.py`

---

## Issue 4 — Tracking System Audit

### What Is Configured
A basic implementation of Google Analytics exists in `_document.tsx` (or layout) using a standard script tag, but it is not optimized for Next.js App Router navigation. The IDs are pulled from `.env`, but there's no event listener attached to route changes (`usePathname` / `useSearchParams`).

### What Is Missing
App Router does not completely reload the page on soft navigations. Therefore, the GA script only fires on the initial page load. Subsequent clicks to different pages do not log new pageviews in GA4. The `next/script` tag should be used with `strategy="afterInteractive"`, and a specific client component must manually trigger `gtag('config', ...)` on route changes.

### Files Involved (with exact paths)
- `frontend/app/layout.tsx`
- `frontend/app/components/Analytics.tsx` (Missing/Needs implementation)
- `.env`

---

## Issue 5 — 301 Redirect Audit

### Current Behavior (step by step)
1. Old URL `/car-details/123` is visited.
2. The `app/car-details/[id]/page.tsx` component mounts.
3. A client-side `useEffect` hook fires, reading the URL ID.
4. `router.replace('/cars/[new-slug]')` executes after a brief flash.
5. The crawler bot receives a `200 OK` for `/car-details/123` with no indication of a permanent move.

### HTTP Status Actually Returned
**200 OK** (handled by client-side navigation) instead of the SEO-required **301 Moved Permanently**.

### Files Involved (with exact paths)
- `frontend/app/car-details/[id]/page.tsx`
- `frontend/next.config.ts` (needs rewrites/redirects defined here)
- `nginx/begautos.conf`

---

## Issue 6 — Car Not Found Audit

### All Possible Root Causes (numbered)
1. **ISR Cache Miss/Stale Data**: Newly added cars on the backend don't immediately trigger ISR revalidation; the cache remains stale.
2. **`dynamicParams = false`**: If `generateStaticParams` builds the route list, and `dynamicParams` is false, new slugs will explicitly trigger a 404 until a full rebuild.
3. **Case Sensitivity**: The Django backend might query using exact case (`slug="Toyota..."`), while URLs might be transformed to lowercase by the frontend or browser.
4. **Encoding Issues**: Spaces or special characters in the slug aren't perfectly matched between DB and URL encoding.

### Most Likely Cause Based on Codebase
If `generateStaticParams()` is implemented but ISR (`revalidate` time) or on-demand revalidation is missing/failing, newly added models in Django physically exist but Next.js router explicitly 404s them because they aren't in the static manifest.

### Files Involved (with exact paths)
- `frontend/app/cars/[slug]/page.tsx`
- `backend/apps/inventory/views.py`
- `frontend/next.config.ts`

---

## Issue 7 — Slug Uniqueness Audit

### Current Model Definition
The `Inventory` model in Django has a `slug` field (`models.SlugField()`), but it lacks `unique=True`. It may not have an overriden `save()` method that guarantees append-logic (`-1`, `-2`) on creation.

### Validation Gaps
- The Django Admin does not enforce uniqueness upon save.
- The DRF Serializer does not validate that a newly generated slug is globally unique across the `Inventory` table.
- Blank URLs might be generated if a title consists entirely of special characters not handled by `slugify()`.

### Duplicate Risk Assessment
High Risk. Two cars with the exact same Make/Model/Year can generate the exact same slug, fundamentally breaking the `/cars/[slug]` lookup endpoint (which expects `.get()` to return exactly 1 item and will throw `MultipleObjectsReturned` error instead).

### Files Involved (with exact paths)
- `backend/apps/inventory/models.py`
- `backend/apps/inventory/admin.py`
- `backend/apps/inventory/serializers.py`

---

## Priority Fix Order

| Priority | Issue | Impact | Files to Change |
| :--- | :--- | :--- | :--- |
| **1** | **Issue 7: Slug Uniqueness** | API crashes if duplicates exist; URLs break. | `backend/apps/inventory/models.py` |
| **2** | **Issue 6: Car Not Found** | Direct loss of traffic / user frustration. | `frontend/app/cars/[slug]/page.tsx` |
| **3** | **Issue 5: 301 Redirects** | Severe SEO penalty for duplicate content. | `frontend/next.config.ts` |
| **4** | **Issue 3: Brand Filters** | Core UX/conversion flow is broken. | `frontend/app/cars/page.tsx`, `inventoryFilters.ts` |
| **5** | **Issue 1 & 2: Metadata Pipeline** | Poor organic search snippet CTR. | `frontend/app/layout.tsx`, `[slug]/page.tsx` |
| **6** | **Issue 4: Tracking App Router** | Inaccurate analytics/ROI tracking. | `frontend/app/layout.tsx`, `Analytics.tsx` |