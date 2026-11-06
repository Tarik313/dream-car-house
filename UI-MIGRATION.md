# Dream Car House theme migration

BegAutos now uses the Dream Car House / AutoDeal visual language across its existing public pages: orange accents, Inter body text, Outfit headings, rounded inventory cards, light surfaces, and a corresponding dark palette.

## Implementation

- `frontend/app/dream-theme.css`: scoped theme tokens, layout, forms, cards, responsive rules, and footer styling.
- `frontend/app/dream-fonts.css` and `frontend/public/fonts/dream`: locally hosted typefaces from the supplied reference.
- `frontend/components/ui/ThemeToggle.tsx`: system preference, persistent manual selection, cross-tab sync, and keyboard-accessible toggle outside the navbar.
- `frontend/components/ui/VehicleCard.tsx`: shared rendering for featured, related, and filtered inventory, including sold, pre-order, and contact-for-price states.
- Home: reference-style hero/actions, category discovery, dynamic inventory and brand cards, appointment section, showroom, social posts, and footer banner.
- Other pages: inventory filters and grids, brand pages, vehicle details, quote/share dialogs, selling form, about, contact, and gallery.
- Social and brand collections render only supplied records, with explicit empty states. No template demo inventory or fabricated counts were added to the application.

## Preserved boundaries

Header.tsx, Navigation.tsx, and CarInventoryOverlay.jsx match their original SHA-256 checksums. Theme styles are scoped outside the navbar; its Poppins typeface and existing behavior remain in place.

Django code, API paths and payloads, search/filter logic, selling/contact/quote submission handlers, SEO helpers, metadata fetchers, canonical redirects, sitemap, robots, package versions, and the lockfile were retained. Existing BegAutos editorial content and marketing assets remain the content source where no CMS field exists.

## Verification

- Production build: passed, including TypeScript and all route generation.
- Focused ESLint review: passed for ThemeToggle, VehicleCard, LogoCarouselSection, CarouselSection, Social, Hero, and HomeClient.
- 44 browser states: 11 routes × 1440px / 390px widths × light / dark. No horizontal overflow; exactly one main h1 per page.
- Theme toggle and reload persistence: passed.
- Mobile filter visibility and brand selection URL synchronization: passed (`?brand_id=1`).
- Contact validation, successful contact submission, quote dialog, and quote submission: passed against an isolated test API.
- Fresh interaction run: no JavaScript exceptions.

Browser evidence is in `frontend/artifacts/theme-review/browser-pages.json`, `browser-results.json`, and the PNG screenshots. Screenshots use clearly isolated test inventory, not production data. The local test API and browser were stopped after verification.

Live Django/database integration was not verified: this checkout has no configured backend environment or installed Django runtime. The browser fixtures validate the frontend request/response boundary; they do not establish database persistence, email delivery, or production media availability. Configure the existing backend and NEXT_PUBLIC_BASE_URL before live acceptance testing. No test API or fixtures are imported by the application.

Dependencies installed successfully with `npm ci --legacy-peer-deps --no-audit --no-fund`. Plain `npm ci` encounters an existing peer-resolution/lockfile mismatch. The existing `npm run lint` script uses removed `next lint`; focused lint was invoked directly with the installed ESLint binary.

The pre-change frontend snapshot is `/tmp/begautos-frontend-before-theme.tar.gz` (temporary local backup).

---

# Project map

## BegAutos
Django REST API + Next.js App Router. API and SEO contracts are preserved by the theme migration.

- `app/Appointment.tsx` — 41 lines
- `app/Available.tsx` — 0 lines
- `app/BestShowroom.tsx` — 66 lines
- `app/FooterHero.tsx` — 39 lines
- `app/FormOverlay.tsx` — 234 lines; API client
- `app/Hero.tsx` — 119 lines
- `app/MultipleInventory.tsx` — 127 lines
- `app/RelatedCarsCarousel.tsx` — 159 lines; API client
- `app/Social.tsx` — 309 lines
- `app/TransitionWrapper.tsx` — 39 lines
- `app/YouTubeOverlay.tsx` — 108 lines
- `app/_components/HomeClient.tsx` — 93 lines
- `app/about/page.tsx` — 111 lines; server metadata
- `app/api/revalidate/route.ts` — 26 lines
- `app/api/v1/inventory/brands/route.ts` — 42 lines; API client
- `app/byd-cars/page.tsx` — 66 lines; server metadata
- `app/car-details/[id]/page.tsx` — 41 lines; API client
- `app/cars/[slug]/CarDetailClient.tsx` — 831 lines; API client
- `app/cars/[slug]/ShareButton.tsx` — 210 lines
- `app/cars/[slug]/page.tsx` — 166 lines; API client; server metadata
- `app/cars/_components/AllCarsClient.tsx` — 85 lines
- `app/cars/_components/CarsClient.tsx` — 995 lines; API client
- `app/cars/_components/CategoryCopy.tsx` — 69 lines
- `app/cars/_components/PriceRangeFilter.tsx` — 237 lines
- `app/cars/_components/fetchCars.ts` — 31 lines; API client
- `app/cars/_components/types.ts` — 86 lines
- `app/cars/brand/[brandSlug]/page.tsx` — 173 lines; API client; server metadata
- `app/cars/brand/page.tsx` — 230 lines; API client; server metadata
- `app/cars/brand-new/page.tsx` — 91 lines; server metadata
- `app/cars/page.tsx` — 57 lines; server metadata
- `app/cars/pre-owned/page.tsx` — 91 lines; server metadata
- `app/contact/_components/ContactForm.tsx` — 272 lines; API client
- `app/contact/_components/OpeningHours.tsx` — 72 lines
- `app/contact/page.tsx` — 192 lines; server metadata
- `app/gallery/_components/GalleryClient.tsx` — 78 lines; API client
- `app/gallery/_components/GalleryGrid.tsx` — 189 lines
- `app/gallery/layout.tsx` — 33 lines
- `app/gallery/page.tsx` — 51 lines; API client; server metadata
- `app/layout.tsx` — 76 lines; API client
- `app/page.tsx` — 99 lines; API client; server metadata
- `app/robots.ts` — 19 lines
- `app/sell/_components/SellYourCarClient.tsx` — 347 lines; API client
- `app/sell/layout.tsx` — 33 lines
- `app/sell/page.tsx` — 27 lines; server metadata
- `app/sitemap.ts` — 249 lines; API client
- `components/gtm.tsx` — 28 lines
- `components/layouts/Footer.tsx` — 381 lines
- `components/layouts/Header.tsx` — 76 lines
- `components/layouts/Navigation.tsx` — 86 lines
- `components/ui/CarInventoryOverlay.jsx` — 210 lines; API client
- `components/ui/CarouselSection.tsx` — 87 lines
- `components/ui/Features.tsx` — 101 lines
- `components/ui/LogoCarouselSection.tsx` — 91 lines
- `components/ui/searchbar.tsx` — 29 lines
- `lib/inventoryFilters.ts` — 72 lines; API client
- `lib/seo.ts` — 306 lines; API client
- `lib/types.ts` — 0 lines
- `lib/utils.ts` — 12 lines

## Django modules
- `backend/apis/urls.py`: home/, inventory/, site-config/, tinymce/
- `backend/apps/home/urls.py`: slider/, sm/, sell-car/, contact/, subscribers/, people-talk/, sales-representative/
- `backend/apps/inventory/urls.py`: , brands/, brands/<int:brand_id>/seo/, generations/, body-style/, filters/, detail/<slug:slug>/, detail/<slug:slug>/related/, detail/<int:id>/, detail/<int:id>/related/, featured/, stocks/, quote/
- `backend/apps/seo_config/urls.py`: seo/<str:page>/, category-seo/<str:page>/
- `backend/core/urls.py`: admin/, api/v1/

## Dream Car House reference
Primary reference: `/` (Home 07), `public/app/css/styles.css`, `app/globals.css`.
Inventory: listing-grid; vehicle: listing-detail-v1; company: about-us; enquiries: contact.
Other routes are template variants and dashboard demos, not BegAutos functionality.

- `app/about-us/page.tsx`
- `app/add-listing/page.tsx`
- `app/blog/page.tsx`
- `app/blog-detail/page.tsx`
- `app/blog-grid/page.tsx`
- `app/change-password/page.tsx`
- `app/compare/page.tsx`
- `app/contact/page.tsx`
- `app/dashboard/page.tsx`
- `app/dealer-detail/page.tsx`
- `app/dealer-listing/page.tsx`
- `app/faq/page.tsx`
- `app/home01/page.tsx`
- `app/home02/page.tsx`
- `app/home03/page.tsx`
- `app/home04/page.tsx`
- `app/home05/page.tsx`
- `app/home06/page.tsx`
- `app/home08/page.tsx`
- `app/home09/page.tsx`
- `app/home10/page.tsx`
- `app/listing-detail-v1/page.tsx`
- `app/listing-detail-v2/page.tsx`
- `app/listing-detail-v3/page.tsx`
- `app/listing-detail-v4/page.tsx`
- `app/listing-detail-v5/page.tsx`
- `app/listing-grid/page.tsx`
- `app/listing-grid-map/page.tsx`
- `app/listing-grid2/page.tsx`
- `app/listing-list/page.tsx`
- `app/listing-list-map/page.tsx`
- `app/message/page.tsx`
- `app/my-favorite/page.tsx`
- `app/my-listing/page.tsx`
- `app/my-profile/page.tsx`
- `app/my-review/page.tsx`
- `app/page.tsx`
- `app/pricing/page.tsx`
- `app/sale-agents/page.tsx`
- `app/sale-agents-detail/page.tsx`
