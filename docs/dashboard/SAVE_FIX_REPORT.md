# Dashboard Form Save Fix & Full-Stack Audit Report

**Date:** 2026-11-02  
**Baseline Commit:** `ac7e0a0a82a6966bdd922d9568896fa2b9df84fd`  
**Upstream Commit:** `752684117099300d62c8faaf5301ddff38b479e5`  
**Delivered Remote Commit:** `ac06e760153eb341ddef671f7a132659fddfea08`  
**Repository:** `TahamidurTaief/Dream_Car_House-Full_Stack`  
**Branch:** `main`

---

## Executive Summary

This report documents the sequential completion and verification of the five full-stack tasks governing dashboard save integrity, About Us end-to-end dynamic content management, luxury brand fleet landing pages with dynamic SEO, cross-module navigation, and sitemap synchronization.

All changes preserve public website appearance, dashboard design, SSR, Server Actions, SEO, accessibility, and Django permission enforcement without synthetic placeholders, hardcoded fallbacks, or disabled validations.

---

## Sequential Task Execution

### Task 1: Serializer Form Save & Partial Update Defect Resolution (The Save Fix)

#### Finding & Root Cause
When editing existing records in the custom dashboard (such as Brands, VIP Sanctuary, Experience Pillars, Preference Categories, Visual Chronicles Items, and About Us), browser forms submit multipart `FormData`. If an existing image or media asset was left untouched, the browser sent an empty file (`size=0`, `filename=""`) or empty string (`""`).

Because the corresponding Django serializers lacked `to_internal_value` overrides:
1. DRF's `FileField` validation rejected empty strings and 0-byte file objects with HTTP 400:
   ```json
   {"error": {"field_errors": {"image": ["The submitted data was not a file. Check the encoding type on the form."]}}}
   ```
2. HTML form submissions submitting JSON fields (`stats`, `pillars`, `value_pillars`, `highlights`, `specs`) as strings triggered coercion failures unless `QueryDict` was converted.

#### Solution
Implemented robust `to_internal_value` methods across all management serializers handling file inputs and complex JSON fields:
- `BrandManagementSerializer`: Retains existing `image` and `feature_image` on partial updates when empty or 0-byte files are supplied; handles JSON-LD `schema_json` parsing.
- `AboutSectionManagementSerializer`: Retains existing `reel_image` on partial updates; safely unpacks JSON string inputs for `stats` and `pillars`.
- `VipSanctuarySectionManagementSerializer`: Retains existing `background_image` on partial updates; unpacks `value_pillars` JSON.
- `ExperiencePillarManagementSerializer`: Retains existing `image` on partial updates; unpacks `tags` JSON.
- `PreferenceCategoryManagementSerializer`: Retains existing `image` on partial updates; unpacks `highlights` JSON.
- `VisualChroniclesItemManagementSerializer`: Retains existing `front_image` on partial updates; unpacks `specs` JSON.
- `InventoryImageManagementSerializer`: Retains existing `image` on partial updates.

#### Regression Verification
Added `test_save_fix_empty_image_retention_partial_updates` in `backend/apps/dashboard_api/tests.py`, verifying that partial updates with empty strings or 0-byte files successfully validate, omit the empty field from `validated_data`, and retain existing assets.

---

### Task 2: About Us Architecture & Dashboard Management End-to-End Integration

#### Architecture & Models
- **Database Model (`backend/apps/home/models/about_model.py`):** Authoritative `AboutSection` table (`tbl_about_section`) holding:
  - Hero header: `hero_badge`, `hero_title`, `hero_subtitle`
  - Trust metrics: `stats` (`JSONField` storing ordered numbers and labels)
  - Heritage story & quote: `story_eyebrow`, `story_title`, `story_content_p1`, `story_content_p2`, `quote_text`, `quote_author`
  - Showroom reel: `reel_image`, `reel_image_url`, `reel_title`, `reel_duration`, `reel_video_target`, `tour_cta_label`, `tour_video_target`
  - Distinction pillars: `pillars_eyebrow`, `pillars_title`, `pillars` (`JSONField`)
  - Consultation CTA: `cta_title`, `cta_description`, `cta_primary_label`, `cta_secondary_label`, `cta_whatsapp_label`
  - Lifecycle: `is_active`, `updated_at`
- **Migration:** Applied `0029_aboutsection.py`.
- **Admin Registration:** Registered `AboutSectionAdmin` in `backend/apps/home/admin.py`.
- **Public API:** `GET /api/v1/home/about/` returning `PublicAboutSectionSerializer` with optimized WebP URLs. Prevents mutation on read: in-memory `AboutSection()` default is serialized when no row exists, avoiding SQL INSERT during `GET`.
- **Dashboard API:** `/api/v1/dashboard/about-us/` gated by `IsActiveStaff` and `DashboardModelPermission` (`home.view_aboutsection`, `home.change_aboutsection`).
- **Dashboard UI:** Full multi-tab management interface at `/workspace/content/about-us` with Server Action `updateAboutSectionAction`.
- **Frontend SSR:** `frontend/app/about/page.tsx` and `AboutClient.tsx` rendering authentic dynamic data with zero synthetic fallbacks and connected appointment modal triggers.

#### Regression Verification
Added `test_about_section_management_and_public_api` in `backend/apps/dashboard_api/tests.py` testing unauthenticated rejection (403), read-only permission enforcement, superuser retrieval and update, and public API data fidelity.

---

### Task 3: Brand Listing & Brand SEO (`/cars/brand/[brandSlug]` & `/cars/brand`)

#### Architecture & Enhancements
- **Serializers:** Extended `BrandListSerializer` and `BrandSEOSerializer` in `backend/apps/inventory/serializers.py` to expose `slug`, `segment`, and on-page SEO copy (`h1_title`, `short_description`, `long_description`, `feature_image`).
- **Endpoint:** Extended `BrandSEODetailView` in `backend/apps/inventory/views.py` and `urls.py` to support:
  - `GET /api/v1/inventory/brands/<int:brand_id>/seo/`
  - `GET /api/v1/inventory/brands/<slug:slug>/seo/`
  - Resolves slugs with case-insensitivity, hyphen-to-space fallback, and numeric ID fallback.
  - Returns 404 for unpublished or nonexistent brands.
- **Brand Fleet Listing Page (`frontend/app/cars/brand/[brandSlug]/page.tsx`):**
  - Server-rendered brand header with verified logo, segment badge, and dynamic H1/descriptions.
  - Interactive `BrandVehiclesClient` providing live search, price range filter, transmission/fuel filters, body style filters, and pagination.
  - Fallback-free: non-existent brands trigger Next.js `notFound()`.
- **Brand Directory Page (`frontend/app/cars/brand/page.tsx`):**
  - Server-rendered grid of all published luxury brands with live vehicle counts and starting prices.

#### Regression Verification
Added `BrandSEOTests` (7 tests) in `backend/apps/inventory/tests.py`:
- `test_brand_list_serializer_includes_slug_and_segment`
- `test_brand_seo_by_id_success`
- `test_brand_seo_by_slug_success`
- `test_brand_seo_case_insensitive_slug`
- `test_brand_seo_numeric_slug_fallback`
- `test_brand_seo_unpublished_returns_404`
- `test_brand_seo_nonexistent_returns_404`

---

### Task 4: Cross-Linking, Brand Edit Actions & Dynamic Sitemap Integration

#### Dashboard & Navigation Cross-Linking
- **Brand Editor (`dashboard/app/workspace/brands/[id]/edit-client.tsx`):** Added a "View Live Page" deep link directly opening `https://dreamcarhouse.com/cars/brand/<slug>/` in a new tab. Updated canonical placeholder to `https://dreamcarhouse.com/cars/brand/<brand>/`.
- **SEO Navigation Tabs:** Added a `Brand Pages SEO` shortcut tab in `CategorySEOClient` and `PageSEOClient` directing staff directly to Brand SEO controls.
- **Sidebar Integration:** Registered `About Us Page` navigation item in `dashboard/lib/navigation.ts` strictly gated by `home.view_aboutsection`.

#### Dynamic Sitemap Synchronization (`frontend/app/sitemap.ts`)
- Added `/about` to public sitemap with priority 0.8.
- Dynamically queries all published brands via `getAllPublicBrands()` and appends `/cars/brand/${brand.slug}/` routes.
- Respects robots directives and excludes unpublished or hidden records in real time.
- Enhanced `buildMetadataFromSEO` in `frontend/lib/server/api.ts` to support brand SEO metadata, logos, and case-insensitive robots directives.

---

### Task 5: Production-Stack Verification & Verification Matrix

#### 1. Backend Django Automated Tests
```bash
python backend/manage.py test apps.dashboard_api apps.home apps.inventory
```
- **Output:** `Ran 64 tests in 40.989s - OK` (0 errors, 0 failures).
- Covers authentication, session validation, privilege escalation guards, overview aggregates, contact messages, CSRF, brand SEO lookup, about section management, and image retention on form save.

#### 2. Dashboard TypeScript & Transport Unit Tests
```bash
cd dashboard && npm run typecheck && npm run test
```
- **TypeScript:** `next typegen && tsc --noEmit` passed with 0 errors.
- **Unit Tests:** `node --conditions=react-server --import tsx --test tests/*.test.ts` passed (13/13 tests passed).

#### 3. Dashboard Production Build
```bash
cd dashboard && npm run build
```
- **Output:** Compiled successfully in 1559ms; all 34 routes compiled as dynamic/static with standalone output.

#### 4. Frontend Production Build
```bash
cd frontend && npm run build
```
- **Output:** Compiled successfully in 7.9s; TypeScript passed in 5.9s; all 17 public routes generated cleanly with App Router.

---

---

### Task 6: Inventory Create/Update Payload Semantics & Normalization Fix

#### Trace & Reproduction
- **Execution Flow:** `InventoryFormClient` (`form-client.tsx`) → `createInventoryAction` / `updateInventoryAction` (`app/actions/inventory.ts`) → `InventoryDetailView` (`apps/dashboard_api/views.py`) → `InventoryDetailManagementSerializer` (`apps/dashboard_api/serializers.py`) → `Inventory.save()` (`apps/inventory/models/inventory_model.py`).
- **Reproduced Failure Case:**
  When creating or editing a vehicle with blank optional fields across all six tabs (as sent natively in multipart browser `FormData`):
  1. `year: ""` was rejected by DRF's `IntegerField` with:
     ```json
     {"error": {"field_errors": {"year": ["A valid integer is required."]}}}
     ```
  2. `feature_image: ""` was rejected during creation with:
     ```json
     {"error": {"field_errors": {"feature_image": ["The submitted data was not a file. Check the encoding type on the form."]}}}
     ```
  3. `model: ""` and `branch: ""` were deleted from `FormData` on edit, preventing explicit clearing (DRF treated it as an omission and retained the old values).
  4. Changing `brand` (e.g. from Toyota to BMW) while clearing or omitting `model` triggered false-positive relationship validation error:
     ```json
     {"error": {"field_errors": {"model": ["Model generation 'LC300' does not belong to brand 'BMW'."]}}}
     ```
     because `validate()` fell back to `self.instance.model` via `attrs.get("model") or self.instance.model` without distinguishing explicit null from omission.
  5. The dashboard UI dropdown was missing 11 of the 22 backend `FuelTypeChoices`, risking silent overwrite of unsupported or legacy fuel types.
  6. Specifications length constraints were misaligned: `engine_capacity`, `wheel_base`, and `mileage` were defined with `max_length=100` in the serializer while the model constraint is `max_length=20`.

#### Solutions Implemented
1. **Nullable Normalization Without Data Corruption:**
   - In `InventoryDetailManagementSerializer.to_internal_value`, explicitly normalize empty strings to `None` for nullable fields (`model`, `branch`, `body_style`, `year`, `price`, `redirect_url`, `youtube`).
   - If non-numeric strings (e.g. `"not_a_number"`) or invalid data are supplied, they are preserved for DRF validation so validation integrity is never weakened.
   - Blank values never convert into zero or `0.00`.
2. **Omission vs. Explicit Clearing:**
   - On PATCH, omitted keys retain the persisted database value.
   - Explicitly submitted empty strings (`branch=""`, `model=""`, `schema_override=""`) update the database row to `NULL`.
   - `InventoryFormClient` now sends `formData.set("branch", selectedBranchId || "")`, `formData.set("model", selectedModelId || "")`, and `formData.set("schema_override", schemaText.trim() || "")` instead of deleting them.
3. **Relationship Validation Distinguishing Explicit Null:**
   - In `InventoryDetailManagementSerializer.validate`, check `"brand" in attrs` and `"model" in attrs` directly.
   - When `model` is explicitly `None` (cleared), it never falls back to `self.instance.model`, allowing smooth brand changes.
   - When `model` is omitted during a brand change, it retains the existing model and properly asserts brand compatibility.
4. **Complete Fuel Choices & Field Constraint Alignment:**
   - Populated all 22 `FuelTypeChoices` in `InventoryFormClient` and dynamically preserved any existing unsupported fuel type from `initialCar`.
   - Aligned `engine_capacity`, `wheel_base`, and `mileage` to `max_length=20` across serializer and frontend inputs.
   - Added matching `maxLength` constraints to all vehicle inputs (`color`, `drive_type`, `registration_number`, `h1_title`, `target_keyword`, `featured_image_alt`, `canonical_url`).

---

## Automated Verification Suite

#### 1. Backend Django Unit & Regression Tests
```bash
python3 backend/manage.py test apps.dashboard_api apps.home apps.inventory
```
- **Result:** Ran 68 tests in ~39s; 68/68 passed (0 errors, 0 failures).
- Covers inventory multipart create with complete blank optionals, PATCH omission vs explicit clear, brand change with model clearing, validation integrity guards, serializer save defect, brand SEO, about section, and authentication.

#### 2. Dashboard TypeScript & Unit Tests
```bash
cd dashboard && npm run typecheck && npm run test
```
- **TypeScript:** `next typegen && tsc --noEmit` passed with 0 errors.
- **Unit Tests:** `tests/*.test.ts` passed (13/13 passed).

#### 3. Dashboard Production Build
```bash
cd dashboard && npm run build
```
- **Output:** Compiled successfully in 973ms; all 34 routes compiled with standalone output.

#### 4. Frontend Production Build
```bash
cd frontend && npm run build
```
- **Output:** Compiled successfully in 4.5s; all 17 public routes generated cleanly with App Router.

---

## Manual UI Checklist for Acceptance Testing

| Area | Route | Test Action | Expected Result |
|---|---|---|---|
| **Inventory Create Blank Optionals** | `/workspace/inventory/new` | Fill only required fields (Name, Brand, Car Type, Condition, Fuel Type, Transmission, Availability, Status); leave Year, Price, Model, Branch blank. Click "Create Vehicle". | Vehicle created successfully with 201; persisted year, price, model, branch are NULL (not 0). |
| **Inventory Clear Branch** | `/workspace/inventory/[id]` | On an existing car with an assigned branch, select "-- Unassigned (Global / Main) --" and click "Save Changes". | Branch is removed and persists as NULL in database. |
| **Inventory Brand Switch** | `/workspace/inventory/[id]` | Change Brand from Toyota to BMW (Model dropdown automatically resets to empty). Click "Save Changes". | Save succeeds without "Model does not belong to brand" error. Brand is updated and model is cleared. |
| **Inventory Clear Schema** | `/workspace/inventory/[id]` | Clear the Schema.org JSON-LD Override textarea completely and click "Save Changes". | Schema override is cleared and persists as NULL in database. |
| **Inventory Unsupported Fuel** | `/workspace/inventory/[id]` | View vehicle with uncommon/legacy fuel type (e.g. `DIESEL+HYBRID` or `HYDROGEN`). | Dropdown accurately displays the current fuel type without silently switching to PETROL. |
| **Field Length Guards** | `/workspace/inventory/new` | Attempt typing more than 20 chars in Engine Capacity or Mileage. | Browser input restricts length to 20; backend rejects if bypassed. |
| **Dashboard Form Save** | `/workspace/brands/[id]` | Open any brand, change the display order or text without selecting a new logo file, click "Save Changes". | Toast indicates "Brand saved successfully." Logo and feature images remain intact without 400 error. |
| **Brand Live Link** | `/workspace/brands/[id]` | Click the "View Live Page" button in the header bar. | Opens public brand page in new tab. |
| **About Us Management** | `/workspace/content/about-us` | Edit Hero badge, trust metrics, quotation, and click "Save Changes". | Form saves successfully; changes persist in database and refresh live preview. |
| **Public About Us** | `/about` | Load page in browser. Click "Schedule Showroom Tour" or "Watch Cinema Reel". | Opens appointment modal or cinema video modal without errors. |
| **Brand Listing Page** | `/cars/brand/mercedes-benz` | Search vehicles, adjust price slider, change filter. | Grid updates reactively, displays matching vehicles. |
| **Brand Directory** | `/cars/brand` | Load brand grid. | Displays all active brands with logos, car counts, and starting prices. |
| **Public Sitemap** | `/sitemap.xml` | Fetch sitemap. | Includes `/about`, `/cars/brand`, and individual published brand routes. |

---

## Conclusion & Deployment Status

All tasks and regression checks are complete and verified by 81 automated full-stack tests and production builds in both Next.js applications. No secrets, binary databases, or transient build outputs have been staged.
