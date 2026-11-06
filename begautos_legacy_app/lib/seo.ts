import type { Metadata } from "next";

const CANONICAL_HOST = "https://www.begautos.com";

function normalizeCanonicalUrl(url: string): string {
  return url
    .replace("https://begautos.com", CANONICAL_HOST)
    .replace("http://begautos.com", CANONICAL_HOST);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SEOConfigData {
  page: string;
  visibility: "PUBLISHED" | "HIDDEN";
  target_keyword: string | null;
  feature_image: string | null;
  feature_image_alt: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  robots: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  og_type: string;
  og_site_name: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string | null;
  schema_json: Record<string, unknown> | null;
  updated_at: string;
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

/**
 * Normalises "" and undefined to null so callers can rely on a single
 * "missing" value. Unconstrained generic: interfaces don't structurally
 * satisfy Record<string, unknown>, so constraining it breaks inference for
 * typed payloads like CategoryPageSEOData.
 */
export function sanitizeSEO<T>(data: T): T {
  if (!data || typeof data !== "object") return data;
  const sanitized = { ...(data as Record<string, unknown>) };
  for (const key in sanitized) {
    if (sanitized[key] === "" || sanitized[key] === undefined) {
      sanitized[key] = null;
    }
  }
  return sanitized as T;
}

/**
 * Fetch the SEO config for a given page from the Django API.
 * Returns null if no config is saved or the request fails.
 * Uses ISR with 5-minute revalidation.
 */
export async function fetchSEOConfig(
  page: string
): Promise<SEOConfigData | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/v1/site-config/seo/${page}/`, {
      next: { revalidate: 0 }, // dynamic
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Response is wrapped: { success, message, data }
    const rawData = (json.data ?? json) as SEOConfigData;
    return sanitizeSEO(rawData);
  } catch {
    return null;
  }
}

// ─── Category (listing) pages ────────────────────────────────────────────────

/**
 * The subset of fields buildCategoryMetadata() actually reads. Shared by
 * every "page content" SEO shape (category pages, brand pages, ...) so the
 * same metadata builder works for all of them without duplication.
 */
interface MetaSEOFields {
  feature_image: string | null;
  feature_image_alt: string | null;
  target_keyword: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string | null;
}

/** SEO + on-page content for /cars, /cars/brand-new, /cars/pre-owned, /cars/brand. */
export interface CategoryPageSEOData extends MetaSEOFields {
  page: string;
  category_name: string | null;
  visibility: "PUBLISHED" | "HIDDEN";
  schema_json: Record<string, unknown> | null;
  h1_title: string | null;
  short_description: string | null;
  long_description: string | null;
  updated_at: string;
}

/**
 * SEO + on-page content for a single brand's listing page
 * (/cars/brand/<slug>). Same shape as CategoryPageSEOData minus the
 * page/visibility bookkeeping — a brand's `status` already gates whether it
 * (and its page) is reachable at all, so there's no separate hidden flag here.
 */
export interface BrandSEOData extends MetaSEOFields {
  id: number;
  name: string;
  schema_json: Record<string, unknown> | null;
  h1_title: string | null;
  short_description: string | null;
  long_description: string | null;
  seo_updated_at: string;
}

/**
 * Fetch the category-page config from Django.
 * Returns null when nothing has been saved for that page yet, so pages fall
 * back to their existing hardcoded copy rather than rendering blank.
 */
export async function fetchCategorySEO(
  page: string
): Promise<CategoryPageSEOData | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return null;

  try {
    const res = await fetch(
      `${base}/api/v1/site-config/category-seo/${page}/`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const rawData = (json.data ?? json) as CategoryPageSEOData;
    return sanitizeSEO(rawData);
  } catch {
    return null;
  }
}

/**
 * Fetch the SEO + on-page content for a single brand's listing page.
 * Returns null when nothing has been saved yet, so the page falls back to
 * its existing hardcoded copy rather than rendering blank.
 */
export async function fetchBrandSEO(
  brandId: number
): Promise<BrandSEOData | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return null;

  try {
    const res = await fetch(
      `${base}/api/v1/inventory/brands/${brandId}/seo/`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const rawData = (json.data ?? json) as BrandSEOData;
    return sanitizeSEO(rawData);
  } catch {
    return null;
  }
}

/**
 * Maps a category or brand SEO config onto Next's Metadata, mirroring
 * buildMetadata(). Takes any shape with the common MetaSEOFields (category
 * pages, brand pages), not just CategoryPageSEOData specifically.
 */
export function buildCategoryMetadata(
  seo: MetaSEOFields | null,
  fallback: Metadata = {}
): Metadata {
  if (!seo) return fallback;

  const canonical = seo.canonical_url
    ? normalizeCanonicalUrl(seo.canonical_url)
    : null;
  const title = seo.meta_title || null;
  const description = seo.meta_description || null;
  const images = seo.feature_image
    ? [
        {
          url: seo.feature_image,
          ...(seo.feature_image_alt ? { alt: seo.feature_image_alt } : {}),
        },
      ]
    : null;

  return {
    ...fallback,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(seo.robots ? { robots: seo.robots } : {}),
    ...(seo.target_keyword ? { keywords: seo.target_keyword } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      ...(fallback.openGraph ?? {}),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(canonical ? { url: canonical } : {}),
      type: "website",
      siteName: "BEG AUTOS",
      ...(images ? { images } : {}),
    },
    twitter: {
      ...(fallback.twitter ?? {}),
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(seo.feature_image ? { images: [seo.feature_image] } : {}),
    },
  };
}

/** True when an admin set a category page's Visibility to "Hidden". */
export function isCategoryPageHidden(
  seo: CategoryPageSEOData | null
): boolean {
  return seo?.visibility === "HIDDEN";
}

/**
 * True when an admin has set this page's Visibility to "Hidden" in Django admin.
 * Pages use this to return a 404; the sitemap uses it to drop the URL.
 * A missing config is treated as visible, so a page without a saved SEO row
 * keeps working as before.
 */
export function isPageHidden(seo: SEOConfigData | null): boolean {
  return seo?.visibility === "HIDDEN";
}

// ─── Metadata builder ────────────────────────────────────────────────────────

export function buildMetadata(
  page: string,
  seo: SEOConfigData | null
): Metadata {
  const title = seo?.meta_title || null;
  const description = seo?.meta_description || null;
  const canonical = seo?.canonical_url ? normalizeCanonicalUrl(seo.canonical_url) : null;
  const robots = seo?.robots || null;

  // Primary keyword leads, followed by any additional comma-separated keywords.
  const keywordParts = [seo?.target_keyword, seo?.meta_keywords].filter(Boolean);
  const keywords = keywordParts.length ? keywordParts.join(", ") : null;

  const ogTitle = seo?.og_title || null;
  const ogDescription = seo?.og_description || null;
  const ogType = seo?.og_type || null;
  const ogSiteName = seo?.og_site_name || null;

  // feature_image is the default social image; og_image/twitter_image override it.
  const ogImageUrl = seo?.og_image || seo?.feature_image || null;
  const ogImages = ogImageUrl
    ? [
        {
          url: ogImageUrl,
          ...(seo?.feature_image_alt ? { alt: seo.feature_image_alt } : {}),
        },
      ]
    : null;

  const twitterCard = seo?.twitter_card || null;
  const twitterTitle = seo?.twitter_title || null;
  const twitterDescription = seo?.twitter_description || null;
  const twitterImageUrl = seo?.twitter_image || seo?.feature_image || null;
  const twitterImages = twitterImageUrl ? [twitterImageUrl] : null;

  const openGraph: Record<string, any> = {
    ...(ogTitle ? { title: ogTitle } : {}),
    ...(ogDescription ? { description: ogDescription } : {}),
    ...(canonical ? { url: canonical } : {}),
    ...(ogType ? { type: ogType } : {}),
    ...(ogSiteName ? { siteName: ogSiteName } : {}),
    ...(ogImages ? { images: ogImages } : {}),
  };

  const twitter: Record<string, any> = {
    ...(twitterCard ? { card: twitterCard } : {}),
    ...(twitterTitle ? { title: twitterTitle } : {}),
    ...(twitterDescription ? { description: twitterDescription } : {}),
    ...(twitterImages ? { images: twitterImages } : {}),
  };

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(robots ? { robots } : {}),
    ...(keywords ? { keywords } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    ...(Object.keys(openGraph).length > 0 ? { openGraph } : {}),
    ...(Object.keys(twitter).length > 0 ? { twitter } : {}),
  };
}
