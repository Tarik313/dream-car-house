    # BEG AUTOS — Changelog

## [dev] - 2026-04-22

### Phase 1 — SSR Conversion

#### 1.1 Hero Section — CSR to SSR ✅
- Moved slider data fetch from client-side useEffect to server-side in app/page.tsx
- Added fetchSliderData() with revalidate: 60 caching
- Removed loading skeleton and client-side fetch from Hero.tsx
- H1 heading now present in initial HTML — SEO and speed improved
- Files changed: app/page.tsx, app/_components/HomeClient.tsx, components/ui/Hero.tsx



#### 1.2 CarouselSection (Featured Cars) — CSR to SSR ✅
- Moved featured cars fetch from client-side useEffect to server-side in app/page.tsx
- Added fetchFeaturedCars() with revalidate: 60 caching
- Removed useEffect, loading state, error state from CarouselSection.tsx
- Featured cars now present in initial HTML — carousel instant on load
- Files changed: app/page.tsx, app/_components/HomeClient.tsx, components/ui/CarouselSection.tsx



#### 1.3 LogoCarouselSection (Brand Logos) — CSR to SSR ✅
- Moved brands fetch from client-side useEffect to server-side in app/page.tsx
- Added fetchBrands() with revalidate: 300 caching
- Removed fetch useEffect, loading skeleton, error state from LogoCarouselSection.tsx
- Auto-scroll carousel useEffect kept intact
- Brand logos now present in initial HTML — instant on load
- Files changed: app/page.tsx, app/_components/HomeClient.tsx, components/ui/LogoCarouselSection.tsx






#### 1.4 Social Section (BEG Across Socials) — CSR to SSR ✅
- Moved people-talk data fetch from client-side useEffect to server-side in app/page.tsx
- Added fetchSocialData() with revalidate: 300 caching
- is_featured filter and slice(-9) now runs server-side
- Removed useEffect, loading state, error state from Social.tsx
- Social images now present in initial HTML — instant on load
- Files changed: app/page.tsx, app/_components/HomeClient.tsx, app/_components/Social.tsx




#### 1.5 Fix — fetchInitialCars moved to server utility ✅
- Moved fetchInitialCars() from CarsClient.tsx (client) 
  to new file app/cars/_components/fetchCars.ts (server)
- Fixed TypeScript Car type mismatch in AllCarsClient.tsx
- Build passes successfully
- Files changed:
  app/cars/_components/fetchCars.ts (new)
  app/cars/_components/CarsClient.tsx
  app/cars/_components/AllCarsClient.tsx
  app/cars/page.tsx
  app/cars/brand-new/page.tsx
  app/cars/pre-owned/page.tsx




#### 1.6 GTM Pageview Tracking Fix ✅
- Added useEffect in TransitionWrapper.tsx to push page_view 
  event to dataLayer on every route change
- Added window.dataLayer TypeScript declaration in gtm.tsx
- GTM now fires proper page_view on SPA navigation
- GA4 and Google Ads tags will fire correctly on page transitions
- Files changed: app/TransitionWrapper.tsx, components/gtm.tsx






## Phase 2 — Bug Fixes

#### 2.1 + 2.2 Filter & Pagination State Persist ✅
- Filter state now synced to URL query params
- Pagination page number synced to URL
- Back button restores exact filters and page
- Reset button clears URL params
- Suspense boundary added for useSearchParams
- Files changed:
  app/cars/_components/CarsClient.tsx
  app/cars/_components/AllCarsClient.tsx
  app/cars/brand-new/page.tsx
  app/cars/pre-owned/page.tsx




#### 3.1 Sitemap Signal Revalidate ✅
- Updated apps/inventory/signals.py — sitemap revalidation added
- Fixed apps/inventory/apps.py — wrong signal import fixed
- Django running successfully with 4 workers
- Files changed: apps/inventory/signals.py, apps/inventory/apps.py


#### 3.3 Brand-wise Product Pages ✅
- Created new route: app/cars/brand/[brandSlug]/page.tsx
- Dynamic brand pages: /cars/brand/toyota/, /cars/brand/bmw/ etc.
- SSR with server-side brand lookup and car fetching
- Full SEO metadata — title, description, canonical, OG tags
- Filter and pagination fully functional
- 404 for invalid brand names
- Files changed: app/cars/brand/[brandSlug]/page.tsx (new)



#### 4.4 Footer Keep In Touch — WhatsApp Button ✅
- Removed email input form and Go button
- Added WhatsApp button with dynamic phone number
- Phone number fetched from SalesRepresentative API (SSR)
- revalidate: 300 caching applied
- Fallback number: 8801966900600
- Files changed: app/layout.tsx, components/layouts/Footer.tsx



#### 4.6 Car Details Share Button ✅
- Created new ShareButton component
- Share modal with Facebook, WhatsApp, Messenger, LinkedIn, X
- Copy link with "Copied!" feedback
- Smooth slide-up animation
- Placed next to car name (H1)
- Fully responsive
- Files changed:
  app/cars/[slug]/ShareButton.tsx (new)
  app/cars/[slug]/CarDetailClient.tsx