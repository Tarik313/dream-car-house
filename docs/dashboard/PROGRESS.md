# Dashboard progress

Phase: Dashboard Overview & Permission-Scoped Aggregates. Date: 2026-10-21 (Asia/Dhaka). Baseline commit: 06c834fcfbc267cfe080f2c00cfa249b8ea39bec.
No deployment, synthetic analytics, fake metrics, or unpermitted data disclosure.

## Completed

- **Dashboard Overview Aggregates (`/workspace` & `/api/v1/dashboard/overview/`):**
  - Permission-scoped ORM aggregation over actual database models (`Inventory`, `Stock`, `InventoryQuote`, `SellCar`, `ContactMessage`, `Subscriber`, `User`, `Group`).
  - Omission of unpermitted metrics: users lacking permission to view a module do not receive its counts or statistics.
  - Server-rendered initial metric cards with live breakdown badges (e.g. available vs sold vehicles; published vs unlisted stock banners; buying, selling, and after-sales topics; staff vs admin accounts).
  - Server-rendered bounded recent submissions (latest 5 records each for Quotes, Sell Car leads, and Contact Messages) with safe fallbacks.
  - Direct deep-links from each aggregate card to its corresponding management module.
  - Efficient queries: single aggregated query per permitted model (`.aggregate(total=Count("id"), ...)`), eliminating duplicate widget roundtrips and N+1 query patterns.

- **User Accounts Management (`/workspace/users`):**
  - Full server pagination, search across username, first name, last name, and email (`q=`), staff role filter (`is_staff=`), active state filter (`is_active=`), and group membership filter (`group=`).
  - Strict field-level privilege escalation guards: non-superusers cannot create superuser accounts or escalate accounts to `is_superuser=True`.
  - Self-escalation and self-deletion protections: current authenticated staff cannot delete their own account.
  - Last usable active administrator protection: prevents deactivating, demoting (`is_staff=False`, `is_superuser=False`), or deleting the last active superuser.
  - Django password validation APIs integration (`password_validation.validate_password`, minimum 8 characters).
  - Passwords and password hashes are strictly `write_only` and never returned or leaked in serializer payloads.
  - Multi-group assignment and direct permissions multi-select in create/edit drawers.
  - Detail drawer displaying account overview, group associations, and direct permission details.
  - Navigation integration gated by `auth.view_user`.
- **User Groups Management (`/workspace/groups`):**
  - Full server pagination and search across group names (`q=`).
  - Group name uniqueness validation case-insensitively; duplicates rejected with 400 Bad Request.
  - Many-to-many permission assignment interface with permission search filter, select-all, and deselect-all controls.
  - Detail modal displaying member count and assigned permissions with app label codenames.
  - Delete confirmation dialog with active member count warnings.
  - Navigation integration gated by `auth.view_group`.
- **Permissions Catalog (`/api/v1/dashboard/permissions/`):**
  - Direct catalog endpoint exposing all native Django permissions (`id`, `name`, `codename`, `app_label`).
  - Gated by `auth.view_permission`, superuser, or `auth.view_{user,group}`.

- **SEO Configuration - General Pages (`/workspace/seo/pages`):**
  - Full server pagination, search across page, title, or keyword (`q=`), visibility filter (`visibility=`), and robots policy filter (`robots=`).
  - Supported actual page choices: `home`, `gallery`, `about`, `sell`, `byd-cars`, `contact`.
  - Enforced uniqueness per page slug at serializer and database level; duplicate creation rejected with 400 Bad Request.
  - Core HTML metadata controls (`meta_title`, `meta_description`, `meta_keywords`, `canonical_url`, `robots`, `target_keyword`).
  - Social media Open Graph and Twitter Card override controls (`og_title`, `og_description`, `og_type`, `og_site_name`, `twitter_card`, `twitter_title`, `twitter_description`).
  - Validated JSON-LD Schema data (`schema_json`) as genuine JSON object/array; malformed JSON rejected.
  - Validated image uploads (`.jpg, .jpeg, .png, .webp`) server-side with support for partial update retention.
  - Detail slide-over drawer displaying saved metadata, feature images, and formatted JSON-LD blocks.
  - Delete confirmation dialog with safety warning.
  - Navigation integration: desktop sidebar, mobile drawer, workspace home cards, and SEO tab bar (`Search` icon) strictly gated by `seo_config.view_seoconfig`.
- **SEO Configuration - Category & Listing Pages (`/workspace/seo/categories`):**
  - Full server pagination, search across page, category name, H1 title, or keyword (`q=`), visibility filter (`visibility=`), and robots filter (`robots=`).
  - Supported actual listing page choices: `cars`, `brand-new`, `pre-owned`, `brand`.
  - Enforced uniqueness per category page slug at serializer and database level; duplicate creation rejected.
  - Reused existing shared SEO fields matching `inventory.Brand` and `inventory.Inventory` (`target_keyword`, `meta_title`, `meta_description`, `canonical_url`, `robots`, `schema_json`, `feature_image`, `feature_image_alt`).
  - Full support for actual on-page editorial copy: `h1_title`, `short_description` (HTML shown above grid), and `long_description` (HTML shown in footer).
  - Detail slide-over drawer with rendered editorial HTML, search meta, and JSON-LD schema.
  - Delete confirmation dialog with safety warning.
  - Navigation integration: desktop sidebar, mobile drawer, workspace home cards, and SEO tab bar (`FileText` icon) strictly gated by `seo_config.view_categorypageseo`.
- **Indexing & Privacy Policy Compatibility:**
  - Preserved existing indexing policy: all internal dashboard routes remain permanently protected by `X-Robots-Tag: noindex, nofollow, noarchive` and root metadata `robots: { index: false, follow: false, noarchive: true }`.
  - Preserved public website endpoints `GET /api/v1/site-config/seo/<page>/` and `GET /api/v1/site-config/category-seo/<page>/`. When unconfigured, endpoints return 404, allowing frontend pages to fall back safely to hardcoded metadata defaults.
  - Sitemap compatibility preserved: `frontend/app/sitemap.ts` dynamic exclusion via `visibility='HIDDEN'` functions seamlessly with both models.
- **Content & Inbox Modules Previously Completed:**
  - `home.PeopleTalkAboutUs` (`/workspace/content/social-features`)
  - `home.SalesRepresentative` (`/workspace/content/sales-representatives`)
  - `home.Slider` (`/workspace/content/sliders`)
  - `home.SocialMedia` (`/workspace/content/social-media`)
  - `home.ContactMessage` & `home.Subscriber` (`/workspace/inbox/*`)
  - `home.SellCar` & `home.SellYourCarImages` (`/workspace/sell-cars`)
  - `inventory.InventoryQuote` (`/workspace/quotes`)
  - `inventory.Stock` (`/workspace/stocks`)
  - `inventory.Brand` (`/workspace/brands`)

## Verification

| Check | Result / limits |
|---|---|
| Next production build | Passed: `next build && node scripts/prepare-standalone.mjs` (prerendered `/robots.txt` + dynamic routes including `/workspace` with aggregate SSR, `/workspace/users`, `/workspace/groups`, and previous modules). |
| Next Typecheck | Passed: `next typegen && tsc --noEmit` with zero errors. |
| Next ESLint | Passed with `--max-warnings=0` (0 errors, 0 warnings). |
| Next Unit & Transport Tests | Passed: 13 test scenarios pass including navigation permission assertions for User Management (`readOnlyUserMgr`), Group Management (`readOnlyGroupMgr`), Page SEO, and Category SEO. |
| Django Integration & Contract Tests | Passed: 29 integration tests in `apps.dashboard_api.tests` (including `test_overview_aggregates_and_permission_scoping` testing permission-scoped metrics omission, real-time database counts, bounded recent submissions, and unauthenticated denial). |
| Public Preservation | Verified: existing public endpoints, Django admin behavior, and user authentication infrastructure contracts preserved. |

## Known gaps and decisions

- In accordance with constraints:
  - No synthetic page choices were invented. General pages strictly enforce `SEOConfig.PageChoices` (`home`, `gallery`, `about`, `sell`, `byd-cars`, `contact`), and Category pages strictly enforce `CategoryPageSEO.PageChoices` (`cars`, `brand-new`, `pre-owned`, `brand`).
  - No synthetic indexing policy was invented. Dashboard routes permanently emit `noindex, nofollow, noarchive`.
  - Schema structured data (`schema_json`) is validated as true data (JSON object or array); malformed JSON strings are rejected at the API boundary.
  - Image uploads enforce `.jpg, .jpeg, .png, .webp` formats.
  - Deletions are guarded with an explicit confirmation dialog detailing the record and public fallback impact.

## Next phase

1. Advanced faceted filter combinations and batch operations for large-scale inventory fleets.
2. Drag-and-drop multi-image gallery reordering enhancements.
