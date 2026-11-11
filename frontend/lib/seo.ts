import type { Metadata } from "next";
import type { PublicSiteSettings, PublicVehicle } from "./types";

export const DEFAULT_SITE_NAME = "DREAM CAR HOUSE";
export const DEFAULT_PUBLIC_BASE_URL = "https://dreamcarhouse.com";
export const DEFAULT_TITLE_MAX_LEN = 60;
export const DEFAULT_FALLBACK_OG_IMAGE_PATH = "/assets/dch-day-showroom.webp";

const INTERNAL_HOSTS = new Set([
  "backend",
  "frontend",
  "dashboard",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

const SITE_SUFFIX_RE =
  /\s*\|\s*(?:dream\s*car\s*house|dream\s*car\s*ho|dream\s*car|dream|dre|dr|d)\s*$/i;
const DUP_KM_RE = /(km)(?:\s*\1)+/gi;
const PURE_INT_RE = /^\d+(?:,\d+)*$/;
const BROKEN_UNIT_CC_RE = /[^\d\s]\s*cc\b/i;
const BROKEN_TRUNCATED_SUFFIX_RE =
  /\|\s*(?:dream(?:\s+car(?:\s+ho(?:use)?)?)?|dre|dr|d)\s*$/i;

const FUEL_MAPPING: Record<string, string> = {
  PETROL: "Petrol",
  DIESEL: "Diesel",
  OCTANE: "Octane",
  ELECTRIC: "Electric",
  HYBRID: "Hybrid",
  "PETROL+HYBRID": "Petrol Hybrid",
  "DIESEL+HYBRID": "Diesel Hybrid",
  "OCTANE+HYBRID": "Octane Hybrid",
  "CNG+HYBRID": "CNG Hybrid",
  "LPG+HYBRID": "LPG Hybrid",
  "PETROL+PLUG-IN HYBRID": "Petrol Plug-in Hybrid",
  "DIESEL+PLUG-IN HYBRID": "Diesel Plug-in Hybrid",
  "OCTANE+PLUG-IN HYBRID": "Octane Plug-in Hybrid",
  CNG: "CNG",
  LPG: "LPG",
};

export function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export function joinParts(parts: Array<unknown>, sep = " "): string {
  return parts
    .map((p) => cleanText(p))
    .filter((p) => p.length > 0)
    .join(sep);
}

function normalizeOriginCandidate(raw: string): string | null {
  const cleaned = cleanText(raw);
  if (!cleaned || cleaned === "undefined" || cleaned === "null") return null;
  try {
    const parsed = new URL(
      cleaned.startsWith("http://") || cleaned.startsWith("https://")
        ? cleaned
        : `https://${cleaned}`
    );
    const hostname = parsed.hostname.toLowerCase();
    if (
      INTERNAL_HOSTS.has(hostname) ||
      hostname === "undefined" ||
      hostname === "null" ||
      !hostname.includes(".")
    ) {
      return null;
    }
    if (hostname === "dreamcarhouse.com" || hostname === "www.dreamcarhouse.com") {
      return DEFAULT_PUBLIC_BASE_URL;
    }
    return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function getPublicBaseUrl(rawWebsite?: string | null): string {
  const candidates = [
    process.env.PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    rawWebsite,
    DEFAULT_PUBLIC_BASE_URL,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeOriginCandidate(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return DEFAULT_PUBLIC_BASE_URL;
}

export function resolvePublicUrl(
  pathOrUrl?: string | null,
  baseUrl?: string | null
): string {
  const base = getPublicBaseUrl(baseUrl);
  const raw = cleanText(pathOrUrl);
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      const hostname = parsed.hostname.toLowerCase();
      if (INTERNAL_HOSTS.has(hostname)) {
        return `${base}${parsed.pathname}${parsed.search}`;
      }
      if (hostname === "dreamcarhouse.com" || hostname === "www.dreamcarhouse.com") {
        return `${base}${parsed.pathname}${parsed.search}`;
      }
      return parsed.toString();
    } catch {
      return raw;
    }
  }

  if (raw.startsWith("/")) {
    return `${base}${raw}`;
  }
  if (raw.startsWith("media/") || raw.startsWith("assets/") || raw.startsWith("images/")) {
    return `${base}/${raw}`;
  }
  return `${base}/media/${raw}`;
}

export function normalizeCanonicalUrl(
  pathOrUrl?: string | null,
  baseUrl?: string | null
): string {
  const base = getPublicBaseUrl(baseUrl);
  const raw = cleanText(pathOrUrl);
  if (!raw || raw === "/") {
    return `${base}/`;
  }

  let pathname = raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      const hostname = parsed.hostname.toLowerCase();
      if (
        INTERNAL_HOSTS.has(hostname) ||
        hostname === "dreamcarhouse.com" ||
        hostname === "www.dreamcarhouse.com" ||
        base.endsWith(parsed.host)
      ) {
        pathname = parsed.pathname;
      } else {
        pathname = parsed.pathname;
      }
    } catch {
      pathname = "/";
    }
  }

  // Strip query/hash fragments for canonical consistency
  pathname = pathname.split(/[?#]/)[0] || "/";
  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }
  pathname = pathname.replace(/\/{2,}/g, "/");

  if (pathname === "/") {
    return `${base}/`;
  }
  const hasFileExt = /\.[a-z0-9]{2,5}$/i.test(pathname);
  if (!hasFileExt && !pathname.endsWith("/")) {
    pathname = `${pathname}/`;
  }
  return `${base}${pathname}`;
}

export function getDefaultOgImage(
  settings?: Partial<PublicSiteSettings> | null,
  baseUrl?: string | null
): string {
  const base = getPublicBaseUrl(baseUrl ?? settings?.website);
  const candidate =
    cleanText(settings?.logo) ||
    cleanText(settings?.logo_light) ||
    DEFAULT_FALLBACK_OG_IMAGE_PATH;
  return resolvePublicUrl(candidate, base);
}

export function formatEngineCapacity(value: unknown): string {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  if (PURE_INT_RE.test(cleaned)) {
    return `${cleaned.replace(/,/g, "")} cc`;
  }
  return cleaned;
}

export function formatMileage(value: unknown): string {
  let cleaned = cleanText(value);
  if (!cleaned) return "";
  cleaned = cleaned.replace(DUP_KM_RE, "$1").replace(/\s+/g, " ").trim();
  if (PURE_INT_RE.test(cleaned)) {
    const digits = Number(cleaned.replace(/,/g, ""));
    if (Number.isFinite(digits)) {
      return `${digits.toLocaleString("en-US")} km`;
    }
  }
  const spacedMatch = /^([\d,]+)\s*(km)$/i.exec(cleaned);
  if (spacedMatch) {
    return `${spacedMatch[1]} km`;
  }
  return cleaned;
}

export function formatFuelType(value: unknown): string {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  const upper = cleaned.toUpperCase();
  if (upper in FUEL_MAPPING) {
    return FUEL_MAPPING[upper];
  }
  return cleaned === upper
    ? cleaned
        .toLowerCase()
        .replace(/\b\w/g, (ch) => ch.toUpperCase())
    : cleaned;
}

export function getVehicleDisplayName(
  brandName?: string | null,
  modelName?: string | null,
  name?: string | null
): string {
  const brand = cleanText(brandName);
  const model = cleanText(modelName);
  const rawName = cleanText(name);

  if (rawName) {
    if (brand && !rawName.toLowerCase().startsWith(brand.toLowerCase())) {
      return `${brand} ${rawName}`;
    }
    return rawName;
  }
  return joinParts([brand, model]);
}

export function getVehicleShortName(
  brandName?: string | null,
  modelName?: string | null,
  name?: string | null
): string {
  const brand = cleanText(brandName);
  const model = cleanText(modelName);
  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) {
      return model;
    }
    return `${brand} ${model}`;
  }
  return getVehicleDisplayName(brand, model, name);
}

export function formatTitleWithSite(
  rawTitle?: string | null,
  siteName: string = DEFAULT_SITE_NAME
): string {
  let cleaned = cleanText(rawTitle);
  const site = cleanText(siteName) || DEFAULT_SITE_NAME;
  if (!cleaned) return site;

  let prev: string | null = null;
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(SITE_SUFFIX_RE, "").replace(/^[\s|-]+|[\s|-]+$/g, "");
  }
  if (!cleaned) return site;
  return `${cleaned} | ${site}`;
}

function truncateWordBoundary(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  let cut = text.slice(0, maxLen).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) {
    cut = cut.slice(0, lastSpace).replace(/[\s,\-/|]+$/g, "");
  }
  return cut;
}

export function isMalformedAutoSeoTitle(title?: string | null): boolean {
  const t = cleanText(title);
  if (!t) return true;
  if (t.includes("for Sale | D") && !t.toLowerCase().endsWith("| dream car house")) {
    return true;
  }
  if (
    BROKEN_TRUNCATED_SUFFIX_RE.test(t) &&
    !t.toLowerCase().endsWith("| dream car house")
  ) {
    return true;
  }
  if (BROKEN_UNIT_CC_RE.test(t) && t.toLowerCase().includes("for sale")) {
    return true;
  }
  return false;
}

export function isMalformedAutoSeoDescription(desc?: string | null): boolean {
  const d = cleanText(desc);
  if (!d) return true;
  const raw = String(desc || "");
  if (/kmkm\b/i.test(raw)) return true;
  if (/hybrid\s+hybrid/i.test(d)) return true;
  if (/\bin\s{2,}for\b/i.test(raw)) return true;
  if (/\bin\s+for\b/i.test(d)) return true;
  if (/\bin\s*$/i.test(d)) return true;
  return false;
}

export function isMalformedAutoAlt(alt?: string | null): boolean {
  const a = cleanText(alt);
  if (!a) return true;
  if (/\bin\s*$/i.test(a)) return true;
  return false;
}

export function buildCarMetaTitle(params: {
  year?: number | null;
  brand?: string | null;
  model?: string | null;
  name?: string | null;
  engine_capacity?: string | null;
  body_style?: string | null;
  siteName?: string;
  maxLen?: number;
}): string {
  const site = cleanText(params.siteName) || DEFAULT_SITE_NAME;
  const maxLen = params.maxLen ?? DEFAULT_TITLE_MAX_LEN;
  const suffix = ` | ${site}`;
  const maxBaseLen = Math.max(12, maxLen - suffix.length);

  const yearStr = params.year ? String(params.year) : "";
  const displayName = getVehicleDisplayName(params.brand, params.model, params.name);
  const shortName = getVehicleShortName(params.brand, params.model, params.name);
  const eng = formatEngineCapacity(params.engine_capacity);
  const body = cleanText(params.body_style);

  const headlineFull = joinParts([yearStr, displayName]);
  const headlineShort = joinParts([yearStr, shortName]);

  const candidates = [
    joinParts([headlineFull, eng, body]),
    joinParts([headlineFull, eng]),
    joinParts([headlineFull, body]),
    headlineFull,
    joinParts([headlineShort, eng, body]),
    joinParts([headlineShort, body]),
    headlineShort,
    displayName,
    shortName,
  ];

  for (const cand of candidates) {
    if (cand && cand.length <= maxBaseLen) {
      return `${cand}${suffix}`;
    }
  }

  const base = truncateWordBoundary(headlineShort || headlineFull || site, maxBaseLen);
  return `${base}${suffix}`;
}

function formatLocation(branchName?: string | null): string {
  const loc = cleanText(branchName);
  if (!loc) return "";
  if (loc.toLowerCase().includes("dhaka")) return loc;
  return `${loc}, Dhaka`;
}

export function buildCarMetaDescription(params: {
  year?: number | null;
  brand?: string | null;
  model?: string | null;
  name?: string | null;
  color?: string | null;
  engine_capacity?: string | null;
  fuel_type?: string | null;
  body_style?: string | null;
  mileage?: string | null;
  price?: string | number | null;
  raw_price?: string | number | null;
  is_call_for_price?: boolean;
  branch_name?: string | null;
  siteName?: string;
}): string {
  const site = cleanText(params.siteName) || DEFAULT_SITE_NAME;
  const yearStr = params.year ? String(params.year) : "";
  const displayName =
    getVehicleDisplayName(params.brand, params.model, params.name) || "Luxury Vehicle";
  let subject = joinParts([yearStr, displayName]);

  const colorClean = cleanText(params.color);
  if (colorClean) {
    subject = `${subject} in ${colorClean}`;
  }

  const eng = formatEngineCapacity(params.engine_capacity);
  const fuel = formatFuelType(params.fuel_type);
  const includeFuel =
    Boolean(fuel) && !eng.toLowerCase().includes(fuel.toLowerCase());

  const specs = joinParts([
    eng,
    includeFuel ? fuel : "",
    cleanText(params.body_style),
  ]);

  const lead = joinParts([subject, specs]);

  let pricePhrase = "";
  const rawPriceCandidate = params.raw_price ?? params.price;
  const priceStr = cleanText(rawPriceCandidate);
  const isCall =
    Boolean(params.is_call_for_price) ||
    priceStr.toLowerCase().includes("call for price");

  if (!isCall && priceStr) {
    const stripped = priceStr.replace(/[^\d.]/g, "");
    const numericPrice = stripped ? Math.trunc(Number(stripped)) : NaN;
    if (Number.isFinite(numericPrice) && numericPrice > 0) {
      pricePhrase = `for BDT ${numericPrice.toLocaleString("en-US")}`;
    } else if (/^[\d,]+$/.test(priceStr)) {
      pricePhrase = `for BDT ${priceStr}`;
    }
  }

  const sentences: string[] = [`Discover this ${joinParts([lead, pricePhrase])}.`];

  const mileageLabel = formatMileage(params.mileage);
  if (mileageLabel) {
    sentences.push(`${mileageLabel} driven.`);
  }

  const locationLabel = formatLocation(params.branch_name);
  if (locationLabel) {
    sentences.push(`Available at ${locationLabel} on ${site}.`);
  } else {
    sentences.push(`View full specifications on ${site}.`);
  }

  return sentences.join(" ").replace(/\s+/g, " ").trim().slice(0, 500);
}

export function buildFeaturedImageAlt(params: {
  year?: number | null;
  brand?: string | null;
  model?: string | null;
  name?: string | null;
  color?: string | null;
  siteName?: string;
}): string {
  const yearStr = params.year ? String(params.year) : "";
  const displayName =
    getVehicleDisplayName(params.brand, params.model, params.name) || "Luxury Vehicle";
  const colorClean = cleanText(params.color);
  const site = cleanText(params.siteName) || DEFAULT_SITE_NAME;
  return joinParts([
    yearStr,
    displayName,
    colorClean ? `in ${colorClean}` : "",
    `- ${site}`,
  ]).slice(0, 200);
}

export type CarSeoInput = Partial<PublicVehicle> & {
  slug: string;
  name: string;
};

export interface BuiltCarSeo {
  title: string;
  description: string;
  imageAlt: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  jsonLdDescription: string;
  engineCapacityText: string;
  mileageText: string;
  fuelTypeText: string;
}

export function buildCarSeo(
  car: CarSeoInput,
  options?: {
    settings?: Partial<PublicSiteSettings> | null;
    baseUrl?: string | null;
  }
): BuiltCarSeo {
  const siteName = cleanText(options?.settings?.name) || DEFAULT_SITE_NAME;
  const baseUrl = getPublicBaseUrl(options?.baseUrl ?? options?.settings?.website);

  const computedTitle = buildCarMetaTitle({
    year: car.year,
    brand: car.brand,
    model: car.model,
    name: car.name,
    engine_capacity: car.engine_capacity,
    body_style: car.body_style,
    siteName,
  });

  const existingTitle = cleanText(car.meta_title);
  let title = computedTitle;
  if (
    existingTitle &&
    !isMalformedAutoSeoTitle(existingTitle) &&
    existingTitle.length <= DEFAULT_TITLE_MAX_LEN + 8
  ) {
    title = formatTitleWithSite(existingTitle, siteName);
    if (title.length > DEFAULT_TITLE_MAX_LEN + 8) {
      title = computedTitle;
    }
  }

  const computedDescription = buildCarMetaDescription({
    year: car.year,
    brand: car.brand,
    model: car.model,
    name: car.name,
    color: car.color,
    engine_capacity: car.engine_capacity,
    fuel_type: car.fuel_type,
    body_style: car.body_style,
    mileage: car.mileage,
    price: car.price,
    raw_price: car.raw_price,
    is_call_for_price: car.is_call_for_price,
    branch_name: car.branch_name || car.branch?.short_name || car.branch?.name,
    siteName,
  });

  const existingDescription = cleanText(car.meta_description);
  const description =
    existingDescription && !isMalformedAutoSeoDescription(car.meta_description)
      ? existingDescription
      : computedDescription;

  const existingAlt = cleanText(car.featured_image_alt);
  const imageAlt =
    existingAlt && !isMalformedAutoAlt(existingAlt)
      ? existingAlt
      : buildFeaturedImageAlt({
          year: car.year,
          brand: car.brand,
          model: car.model,
          name: car.name,
          color: car.color,
          siteName,
        });

  const canonicalUrl = normalizeCanonicalUrl(
    car.canonical_url || `/cars/${car.slug}/`,
    baseUrl
  );

  const fallbackOg = getDefaultOgImage(options?.settings, baseUrl);
  const resolvedCarImg = resolvePublicUrl(car.image, baseUrl);
  const ogImage = resolvedCarImg || fallbackOg;

  return {
    title,
    description,
    imageAlt,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    jsonLdDescription: description,
    engineCapacityText: formatEngineCapacity(car.engine_capacity),
    mileageText: formatMileage(car.mileage),
    fuelTypeText: formatFuelType(car.fuel_type),
  };
}

export interface CleanPageMetadataInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  robots?: Metadata["robots"];
  keywords?: Metadata["keywords"];
  settings?: Partial<PublicSiteSettings> | null;
  baseUrl?: string | null;
}

export function buildCleanPageMetadata(input: CleanPageMetadataInput): Metadata {
  const siteName = cleanText(input.settings?.name) || DEFAULT_SITE_NAME;
  const baseUrl = getPublicBaseUrl(input.baseUrl ?? input.settings?.website);
  const canonical = normalizeCanonicalUrl(input.path, baseUrl);
  const title = formatTitleWithSite(input.title, siteName);
  const ogTitle = cleanText(input.ogTitle)
    ? formatTitleWithSite(input.ogTitle, siteName)
    : title;
  const twitterTitle = cleanText(input.twitterTitle)
    ? formatTitleWithSite(input.twitterTitle, siteName)
    : ogTitle;

  const description = cleanText(input.description);
  const ogDescription = cleanText(input.ogDescription) || description;
  const twitterDescription = cleanText(input.twitterDescription) || ogDescription;

  const image =
    resolvePublicUrl(input.ogImage, baseUrl) ||
    getDefaultOgImage(input.settings, baseUrl);

  return {
    title,
    description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    ...(input.robots ? { robots: input.robots } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName,
      locale: "en_US",
      type: "website",
      images: image
        ? [
            {
              url: image,
              alt: ogTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: image ? [image] : undefined,
    },
  };
}
