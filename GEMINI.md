# DREAM CAR HOUSE - MANDATORY ARCHITECTURAL RULES & GUIDELINES

> [!IMPORTANT]
> The following rules are mandatory and must be strictly followed for all development, feature implementations, bug fixes, and maintenance across the Dream Car House project.

---

## 1. FULLY SSR-BASED ARCHITECTURE & SERVER ACTIONS
- **Server-Side Rendering (SSR):** Every public website page and dynamic route must be rendered on the server (Next.js Server Components) using `fetch` with appropriate revalidation/cache policies.
- **Server Actions:** All data mutations, forms, inquiry submissions, and dashboard updates must utilize Next.js Server Actions with strict server-side validation and structured error handling.
- **No Client-Only Fallbacks:** Avoid rendering full pages as purely client-side components when they should be server-rendered for speed, performance, and search engines.

---

## 2. STRICT DYNAMIC DATA FROM BACKEND APIS (NO FALLBACK OR STATIC DATA)
- **Zero Static Mock Data:** All data—including vehicles, showroom stories, site identity, audio/sound settings, banners, brands, testimonials, and contact details—must be fetched dynamically via SSR from the Django REST API backend.
- **No Hardcoded Mock Arrays:** Never leave static placeholder arrays or mock JSON in the frontend. If a required field, configuration, or model does not exist in the backend, implement it in the backend first.
- **Single Source of Truth:** The Django REST API backend and database is the sole authoritative source for all content displayed on both the website and dashboard.

---

## 3. DYNAMIC SEO & STRUCTURED METADATA
- **Dynamic Metadata:** Every page route must implement `generateMetadata()` using data returned from backend SEO and entity endpoints.
- **Rich Snippets & OpenGraph:** Title, description, keywords, OpenGraph tags (`og:image`, `og:title`), Twitter cards, canonical URLs, and Schema.org JSON-LD (such as `AutoDealer`, `Car`, `Product`, `BreadcrumbList`) must be dynamically populated based on real backend data.

---

## 4. STRICT 3-STEP IMPLEMENTATION SEQUENCE
Whenever implementing a new feature or modifying an existing one, strictly follow this chronological sequence:
1. **Step 1 - Backend API & Database:**
   - Update or create Django models, database migrations, DRF serializers, and API endpoints.
   - Test and verify the API endpoint output via curl or PowerShell before moving forward.
2. **Step 2 - Next.js Custom Dashboard:**
   - Create or update dashboard management views, form clients, and Server Actions.
   - Verify that staff can create, read, update, and toggle the feature directly from the dashboard.
3. **Step 3 - Website Frontend (Luxury UI):**
   - Consume the backend API inside SSR server components or Server Actions.
   - Render the dynamic UI on the website and verify end-to-end functionality.

---

## 5. CODE HYGIENE & DUPLICATION PREVENTION
- **Prevent Duplicate Models/Content:** Always check existing models in `apps/home`, `apps/dealership`, `apps/inventory`, and `apps/dashboard_api` before creating new ones. Never duplicate database tables or serializer representations.
- **Clean Organization:** Keep directory structure clean and modular. Preserve separation of concerns between API contracts, dashboard management, and public storefront presentation.
- **Field Consistency:** Ensure field names and data types match 100% across Django models, DRF serializers, TypeScript interfaces, and form inputs.

---

## 6. MULTIPLE-ROUND TESTING & ZERO-MISMATCH POLICY
- **Mandatory Multi-Step Testing:** Never conclude a task or commit code without actively testing:
  - Backend API endpoint response (HTTP status, JSON structure).
  - Dashboard form submission and database persistence.
  - Frontend website SSR rendering and browser client behavior.
- **Zero Tolerances for Mismatches:** Inspect and resolve any TypeScript errors, missing prop warnings, or payload mismatches before considering any task done.

---

## 7. GIT WORKFLOW & REMOTE SYNC (TARIK313)
- **Parent Remote:** Remote origin points to `https://github.com/Tarik313/dream-car-house.git`.
- **Direct & Valid Commits:** Use clear, descriptive, conventional commit messages.
- **No Unnecessary Branches:** No need to create multiple temporary branches for standard tasks unless explicitly instructed.
- **Permanent Push:** When a feature or correction is permanently completed and verified across all 3 steps, commit cleanly and push directly to the parent remote repository (`main` branch) for `Tarik313`.
