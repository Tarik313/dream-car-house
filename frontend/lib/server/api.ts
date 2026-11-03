import "server-only";
import { cache } from "react";
import type { Metadata } from "next";
import type {
  PublicSiteSettings,
  PublicShowroomBranch,
  PublicHeroSlider,
  PublicHeroCta,
  PublicVehicle,
  PublicVehicleImage,
  PublicInventoryFilterOptions,
  PublicPreferenceSection,
  PublicBrand,
  PublicConsultationSection,
  PublicExperienceSection,
  PublicVisualChroniclesSection,
  PublicVipSanctuarySection,
  PublicPageSEO,
  PublicCategorySEO,
  PublicBrandSEO,
  PublicAboutSection,
} from "@/lib/types";

export function getBackendOrigin(): string {
  const origin =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BACKEND_API_ORIGIN;

  if (!origin || !origin.trim()) {
    throw new Error(
      "Missing required backend origin configuration (set INTERNAL_BACKEND_URL or NEXT_PUBLIC_BASE_URL)"
    );
  }

  return origin.trim().replace(/\/$/, "");
}

function validateSiteSettingsPayload(data: unknown): data is PublicSiteSettings {
  if (!data || typeof data !== "object") return false;
  const s = data as Record<string, unknown>;
  return (
    typeof s.name === "string" &&
    s.name.trim().length > 0 &&
    typeof s.hotline === "string" &&
    typeof s.phone === "string" &&
    typeof s.email === "string" &&
    typeof s.whatsapp === "string" &&
    typeof s.primary_address === "string"
  );
}

function validateShowroomBranchesPayload(data: unknown): data is PublicShowroomBranch[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (b) =>
      b &&
      typeof b === "object" &&
      typeof b.branch_id === "string" &&
      typeof b.name === "string" &&
      typeof b.address === "string"
  );
}

function sanitizeCtaButtons(buttons: unknown): PublicHeroCta[] {
  if (!Array.isArray(buttons)) return [];
  const cleaned: PublicHeroCta[] = [];
  for (const btn of buttons) {
    if (!btn || typeof btn !== "object") continue;
    const item = btn as Record<string, unknown>;
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const action = item.action === "appointment_modal" ? "appointment_modal" : "link";
    let destination = typeof item.destination === "string" ? item.destination.trim() : "";
    if (destination.toLowerCase().startsWith("javascript:") || destination.includes("<script")) {
      destination = "/";
    }
    if (label) {
      cleaned.push({ label, action, destination });
    }
  }
  return cleaned;
}

function normalizeHeroPayload(data: unknown): PublicHeroSlider {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid hero slider payload: expected non-empty object.");
  }
  const s = data as Record<string, unknown>;

  const heading = typeof s.heading === "string" ? s.heading.trim() : "";
  const poster = typeof s.poster === "string" ? s.poster.trim() : "";
  const provider = s.video_provider === "vimeo" || s.video_provider === "direct" ? s.video_provider : "youtube";
  const source = typeof s.video_source === "string" ? s.video_source.trim() : "";
  const startTime = typeof s.video_start_time === "number" ? Math.max(0, s.video_start_time) : 0;
  const videoTitle = typeof s.video_title === "string" ? s.video_title.trim() : "";
  const ctas = sanitizeCtaButtons(s.cta_buttons);
  const scrollLabel = typeof s.scroll_link_label === "string" ? s.scroll_link_label.trim() : "";
  const scrollTarget = typeof s.scroll_link_target === "string" ? s.scroll_link_target.trim() : "";

  return {
    id: typeof s.id === "number" ? s.id : null,
    heading,
    poster,
    video_provider: provider,
    video_source: source,
    video_start_time: startTime,
    video_title: videoTitle,
    cta_buttons: ctas,
    scroll_link_label: scrollLabel,
    scroll_link_target: scrollTarget,
    image: typeof s.image === "string" ? s.image : null,
    is_published: s.is_published !== false,
  };
}


/**
 * Deduplicated, server-only public SiteSettings fetcher.
 * - Enforces explicit backend origin (fails loudly if unset)
 * - 5-second timeout via AbortSignal.timeout(5000)
 * - Fresh reads initially (cache: 'no-store')
 * - Deduplicated within a single request via React cache()
 * - Never forwards staff credentials or cookies
 */
export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/site-settings/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    throw new Error("Public site settings have not been configured (404 NOT FOUND).");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch public site settings: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true || !validateSiteSettingsPayload(json.data)) {
    throw new Error("Invalid settings payload or missing required settings record.");
  }

  return json.data;
});

/**
 * Deduplicated, server-only public ShowroomBranches fetcher.
 * - Published-only branches returned by backend
 * - Deduplicated within a single request via React cache()
 */
export const getShowroomBranches = cache(async (): Promise<PublicShowroomBranch[]> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/branches/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch showroom branches: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true || !validateShowroomBranchesPayload(json.data)) {
    throw new Error("Invalid showroom branches payload.");
  }

  // Double assert published only
  return json.data.filter((branch) => !branch.status || branch.status === "PUBLISHED");
});

export const fetchLayoutData = cache(
  async (): Promise<{
    settings: PublicSiteSettings;
    branches: PublicShowroomBranch[];
    featuredVehicles: PublicVehicle[];
  }> => {
    const [settings, branches, featuredVehicles] = await Promise.all([
      getSiteSettings(),
      getShowroomBranches(),
      getFeaturedInventory().catch(() => []),
    ]);
    return { settings, branches, featuredVehicles };
  }
);

/**
 * Deduplicated, server-only public HeroSlider fetcher.
 * - Enforces explicit backend origin
 * - 5-second timeout via AbortSignal.timeout(5000)
 * - Fresh reads initially (cache: 'no-store')
 * - Deduplicated within a single request via React cache()
 * - Never forwards staff credentials or cookies
 */
export const getHeroSlider = cache(async (): Promise<PublicHeroSlider | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/slider/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (res.status === 422) {
    const errorJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
    const msg = typeof errorJson.error === "object" ? errorJson.error?.message : errorJson.error;
    throw new Error(msg || "Published slider requires a valid heading (HTTP 422 Unprocessable Entity).");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch hero slider configuration: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true || !json.data) {
    throw new Error("Invalid hero slider response payload.");
  }

  return normalizeHeroPayload(json.data);
});

/**
 * Normalizes backend Inventory serializer payload into frontend PublicVehicle interface.
 */
export function mapBackendCarToVehicle(car: Record<string, unknown>): PublicVehicle {
  const branchRaw = car.branch && typeof car.branch === "object" ? (car.branch as Record<string, unknown>) : null;
  const branchId = typeof branchRaw?.branch_id === "string" ? branchRaw.branch_id : "";
  const branchName = typeof branchRaw?.name === "string" ? branchRaw.name : "";
  const branchAddress = typeof branchRaw?.address === "string" ? branchRaw.address : "";

  const carType = car.car_type === "PRE_OWNED" ? "PRE_OWNED" : "BRAND_NEW";

  let engineCapacity = "";
  if (car.engine_capacity) {
    const rawCap = String(car.engine_capacity).trim();
    if (/^\d+$/.test(rawCap)) {
      engineCapacity = `${rawCap} cc`;
    } else {
      engineCapacity = rawCap;
    }
  }

  let mileage = "";
  if (car.mileage) {
    const rawMil = String(car.mileage).trim();
    if (/^\d+$/.test(rawMil)) {
      mileage = `${parseInt(rawMil, 10).toLocaleString()} km`;
    } else {
      mileage = rawMil;
    }
  } else {
    mileage = carType === "BRAND_NEW" ? "Brand New (00 km)" : "Verified";
  }

  const rawImages = Array.isArray(car.inventory_images) ? car.inventory_images : [];
  const images: PublicVehicleImage[] = rawImages.map((img: Record<string, unknown>) => ({
    id: typeof img.id === "number" ? img.id : undefined,
    url: typeof img.image === "string" ? img.image : "",
    caption: typeof img.caption === "string" && img.caption ? img.caption : typeof img.alt_text === "string" ? img.alt_text : String(car.name || "Showroom Vehicle"),
    tag: typeof img.tag === "string" && img.tag ? img.tag : "EXTERIOR",
    order: typeof img.order === "number" ? img.order : 1,
  }));

  const featureImg =
    typeof car.feature_image === "string" && car.feature_image
      ? car.feature_image
      : images[0]?.url || "/assets/maybach_hero_poster.jpg";

  if (images.length === 0) {
    images.push({
      url: featureImg,
      caption: String(car.name || "Showroom Vehicle"),
      tag: "EXTERIOR",
      order: 1,
    });
  }

  let priceDisplay = "Call for Price";
  if (car.is_call_for_price) {
    priceDisplay = "Call for Price";
  } else if (car.price) {
    priceDisplay = String(car.price);
  }

  return {
    id: typeof car.id === "number" ? car.id : 0,
    name: String(car.name || "Luxury Automobile"),
    brand: String(car.brand || ""),
    model: String(car.model_name || car.model || ""),
    year: typeof car.year === "number" ? car.year : parseInt(String(car.year || "0"), 10) || 0,
    car_type: carType,
    fuel_type: String(car.fuel_type || "Petrol"),
    engine_capacity: engineCapacity,
    mileage,
    price: priceDisplay,
    raw_price: typeof car.raw_price === "string" ? car.raw_price : null,
    is_call_for_price: Boolean(car.is_call_for_price),
    registered: String(car.registered || "Available"),
    branch_id: branchId,
    branch_name: branchName,
    branch_address: branchAddress,
    branch: branchRaw as PublicShowroomBranch | null,
    image: featureImg,
    images,
    description: String(car.description || ""),
    slug: String(car.slug || car.id || ""),
    drivetrain: typeof car.drive_type === "string" ? car.drive_type : undefined,
    registration_number: typeof car.registration_number === "string" ? car.registration_number : undefined,
    is_featured: Boolean(car.is_featured),
    transmission: typeof car.transmission === "string" ? car.transmission : undefined,
    color: typeof car.color === "string" ? car.color : undefined,
    wheel_base: typeof car.wheel_base === "string" ? car.wheel_base : undefined,
    condition: typeof car.condition === "string" ? car.condition : undefined,
    body_style: typeof car.body_style === "string" ? car.body_style : undefined,
    youtube: typeof car.youtube === "string" ? car.youtube : undefined,
    slightly_negotiable: typeof car.slightly_negotiable === "string" ? car.slightly_negotiable : undefined,
    h1_title: typeof car.h1_title === "string" ? car.h1_title : undefined,
    target_keyword: typeof car.target_keyword === "string" ? car.target_keyword : undefined,
    meta_title: typeof car.meta_title === "string" ? car.meta_title : undefined,
    meta_description: typeof car.meta_description === "string" ? car.meta_description : undefined,
    canonical_url: typeof car.canonical_url === "string" ? car.canonical_url : undefined,
    featured_image_alt: typeof car.featured_image_alt === "string" ? car.featured_image_alt : undefined,
    indexing: typeof car.indexing === "string" ? car.indexing : undefined,
    schema_data: car.schema_data && typeof car.schema_data === "object" ? (car.schema_data as Record<string, unknown>) : undefined,
    previous_slug: typeof car.previous_slug === "string" ? car.previous_slug : undefined,
  };
}

/**
 * Deduplicated, server-only public featured vehicles fetcher.
 * Returns up to 10 published vehicles where is_featured=true.
 */
export const getFeaturedInventory = cache(async (): Promise<PublicVehicle[]> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/featured/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch featured inventory: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true) {
    throw new Error("Invalid featured inventory response payload.");
  }

  const list = Array.isArray(json.data) ? json.data : [];
  return list.map((item) => mapBackendCarToVehicle(item as Record<string, unknown>));
});

export interface PublicInventoryParams {
  brand?: string;
  type?: string;
  branch?: string;
  body_style?: string;
  q?: string;
  page?: number;
}

/**
 * Deduplicated, server-only public inventory listing fetcher.
 * Matches backend InventoryFilter (supports brand, car_type, branch, body_style, search).
 */
export const getPublicInventory = cache(
  async (
    params: PublicInventoryParams = {}
  ): Promise<{ items: PublicVehicle[]; totalRows: number; totalPages: number }> => {
    const origin = getBackendOrigin();
    const query = new URLSearchParams();

    if (params.brand && params.brand !== "all") {
      query.set("brand", params.brand);
    }
    if (params.type && params.type !== "all") {
      query.set("car_type", params.type);
    }
    if (params.branch && params.branch !== "all") {
      query.set("branch", params.branch);
    }
    if (params.body_style && params.body_style !== "all") {
      query.set("body_style", params.body_style);
    }
    if (params.q && params.q.trim()) {
      query.set("search", params.q.trim());
    }
    if (params.page && params.page > 1) {
      query.set("page", String(params.page));
    }

    const queryString = query.toString();
    const url = `${origin}/api/v1/inventory/${queryString ? `?${queryString}` : ""}`;

    let res: Response;
    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Backend unavailable at ${origin}: ${message}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch inventory listing: HTTP ${res.status}`);
    }

    const json = (await res.json()) as { success?: boolean; data?: unknown };
    if (!json || json.success !== true || !json.data || typeof json.data !== "object") {
      throw new Error("Invalid inventory listing response payload.");
    }

    const dataObj = json.data as Record<string, unknown>;
    const rawList = Array.isArray(dataObj.results) ? dataObj.results : Array.isArray(dataObj.items) ? dataObj.items : Array.isArray(json.data) ? (json.data as unknown[]) : [];
    const totalRows = typeof dataObj.total_rows === "number" ? dataObj.total_rows : rawList.length;
    const totalPages = typeof dataObj.total_page === "number" ? dataObj.total_page : 1;

    const items = rawList.map((item) => mapBackendCarToVehicle(item as Record<string, unknown>));
    return { items, totalRows, totalPages };
  }
);

/**
 * Deduplicated, server-only vehicle detail fetcher by slug.
 * Returns null if vehicle is not found (404) or unpublished.
 */
export const getPublicInventoryDetail = cache(async (slug: string): Promise<PublicVehicle | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/detail/${encodeURIComponent(slug)}/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch vehicle detail: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true || !json.data || typeof json.data !== "object") {
    return null;
  }

  return mapBackendCarToVehicle(json.data as Record<string, unknown>);
});

/**
 * Deduplicated, server-only related vehicles fetcher by slug.
 */
export const getPublicRelatedVehicles = cache(async (slug: string): Promise<PublicVehicle[]> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/detail/${encodeURIComponent(slug)}/related/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return [];
  }

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as { success?: boolean; data?: unknown };
  if (!json || json.success !== true || !json.data) {
    return [];
  }

  const list = Array.isArray(json.data)
    ? json.data
    : typeof json.data === "object" && Array.isArray((json.data as Record<string, unknown>).results)
    ? ((json.data as Record<string, unknown>).results as unknown[])
    : [];

  return list.map((item) => mapBackendCarToVehicle(item as Record<string, unknown>));
});

/**
 * Deduplicated, server-only inventory filter choices fetcher.
 */
export const getInventoryFilters = cache(async (): Promise<PublicInventoryFilterOptions> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/filters/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return { brands: [], models: [], bodyStyles: [], colors: [] };
  }

  if (!res.ok) {
    return { brands: [], models: [], bodyStyles: [], colors: [] };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const data = (json.data && typeof json.data === "object" ? json.data : json) as Record<string, unknown>;

  return {
    brands: Array.isArray(data.brands) ? (data.brands as { id: number; name: string }[]) : [],
    models: Array.isArray(data.models) ? (data.models as { id: number; model: string; brand: number }[]) : [],
    bodyStyles: Array.isArray(data.bodyStyles) ? (data.bodyStyles as { id: number; body: string }[]) : [],
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
  };
});

/**
 * Deduplicated, server-only public PreferenceSection fetcher.
 * - Deduplicated within a single request via React cache()
 * - Fresh reads initially (cache: 'no-store')
 */
export const getPreferenceSection = cache(async (): Promise<PublicPreferenceSection | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/preference-section/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (res.status === 422) {
    const errorJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
    const msg = typeof errorJson.error === "object" ? errorJson.error?.message : errorJson.error;
    throw new Error(msg || "Preference section configuration error: requires at least 1 category (HTTP 422 Unprocessable Entity).");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch preference section: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: PublicPreferenceSection };
  if (!json || json.success !== true || !json.data) {
    throw new Error("Invalid preference section response payload.");
  }

  return json.data;
});

/**
 * Deduplicated, server-only public Brand Runway fetcher.
 * Retrieves published brands configured to show on the homepage Brand Runway.
 * Orders by brand.order, name.
 */
export const getRunwayBrands = cache(async (): Promise<PublicBrand[]> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/brands/?runway=true`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch runway brands: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: PublicBrand[] };
  if (!json || json.success !== true || !Array.isArray(json.data)) {
    throw new Error("Invalid runway brands response payload.");
  }

  return json.data;
});

/**
 * Deduplicated, server-only public fetcher for all published brands.
 * Orders by brand.order, name. Includes slug, image, starting_price, and car count.
 */
export const getAllPublicBrands = cache(async (): Promise<PublicBrand[]> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/brands/`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const json = (await res.json()) as { success?: boolean; data?: PublicBrand[] };
    if (!json || json.success !== true || !Array.isArray(json.data)) {
      return [];
    }
    return json.data;
  } catch (error) {
    console.error("[getAllPublicBrands] Failed to fetch brands:", error);
    return [];
  }
});

/**
 * Deduplicated, server-only public Brand SEO fetcher.
 * Retrieves on-page content and SEO metadata for a single brand (/cars/brand/<slug>).
 * Supports lookup by brand slug (e.g. 'mercedes-benz', 'bmw', 'rolls-royce') or integer id.
 */
export const getBrandSEODetail = cache(async (slugOrId: string | number): Promise<PublicBrandSEO | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/inventory/brands/${encodeURIComponent(String(slugOrId).trim())}/seo/`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success?: boolean; data?: PublicBrandSEO };
    if (!json || json.success !== true || !json.data) {
      return null;
    }
    return json.data;
  } catch (error) {
    console.error(`[getBrandSEODetail] Failed to fetch brand SEO for "${slugOrId}":`, error);
    return null;
  }
});

/**
 * Deduplicated, server-only public Consultation Section fetcher.
 */
export const getConsultationSection = cache(async (): Promise<PublicConsultationSection | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/consultation/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch consultation section: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: PublicConsultationSection };
  if (!json || json.success !== true || !json.data) {
    throw new Error("Invalid consultation section response payload.");
  }

  const d = json.data;
  return {
    tag: typeof d.tag === "string" ? d.tag : "",
    heading: typeof d.heading === "string" ? d.heading : "",
    description: typeof d.description === "string" ? d.description : "",
    trust_pills: Array.isArray(d.trust_pills) ? d.trust_pills : [],
    primary_cta_label: typeof d.primary_cta_label === "string" ? d.primary_cta_label : "",
    primary_cta_action: d.primary_cta_action || "appointment_modal",
    primary_cta_url: d.primary_cta_url || "",
    whatsapp_cta_label: typeof d.whatsapp_cta_label === "string" ? d.whatsapp_cta_label : "",
    whatsapp_url: typeof d.whatsapp_url === "string" ? d.whatsapp_url : "",
    status_beacon_text: typeof d.status_beacon_text === "string" ? d.status_beacon_text : "",
  };
});

/**
 * Deduplicated, server-only public Experience Section fetcher.
 * Validates that at least 3 active pillars exist for published content.
 * Never fabricates or backfills pillars from fallbacks.
 */
export const getExperienceSection = cache(async (): Promise<PublicExperienceSection | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/experience/`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend unavailable at ${origin}: ${message}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (res.status === 422) {
    const errorJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      errorJson.error ||
        "Published Experience Section requires at least 3 active pillars (HTTP 422 Unprocessable Entity)."
    );
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch experience section: HTTP ${res.status}`);
  }

  const json = (await res.json()) as { success?: boolean; data?: PublicExperienceSection };
  if (!json || json.success !== true || !json.data) {
    throw new Error("Invalid experience section response payload.");
  }

  const d = json.data;
  const pillars = Array.isArray(d.pillars) ? d.pillars : [];

  if (pillars.length < 3) {
    throw new Error(
      `Experience Section has fewer than 3 active pillars (${pillars.length} found). At least 3 active pillars are required for publication.`
    );
  }

  return {
    title: typeof d.title === "string" ? d.title : "",
    subtitle: typeof d.subtitle === "string" ? d.subtitle : "",
    video_cta_label: typeof d.video_cta_label === "string" ? d.video_cta_label : "",
    video_target: d.video_target || "reel",
    pillars,
  };
});

/**
 * Deduplicated, server-only public Visual Chronicles Section fetcher.
 */
export const getVisualChroniclesSection = cache(
  async (): Promise<PublicVisualChroniclesSection | null> => {
    const origin = getBackendOrigin();
    const url = `${origin}/api/v1/home/visual-chronicles/`;

    let res: Response;
    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Backend unavailable at ${origin}: ${message}`);
    }

    if (res.status === 404) {
      return null;
    }

    if (res.status === 422) {
      const errorJson = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
      const msg = typeof errorJson.error === "object" ? errorJson.error?.message : errorJson.error;
      throw new Error(msg || "Visual Chronicles section configuration error: requires at least 1 active story card item (HTTP 422 Unprocessable Entity).");
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch visual chronicles section: HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      success?: boolean;
      data?: PublicVisualChroniclesSection;
    };
    if (!json || json.success !== true || !json.data) {
      throw new Error("Invalid visual chronicles response payload.");
    }

    const d = json.data;
    const items = Array.isArray(d.items) ? d.items : [];

    return {
      heading: typeof d.heading === "string" ? d.heading : "",
      subtitle: typeof d.subtitle === "string" ? d.subtitle : "",
      stats_number: typeof d.stats_number === "string" ? d.stats_number : "",
      stats_label: typeof d.stats_label === "string" ? d.stats_label : "",
      archive_tag: typeof d.archive_tag === "string" ? d.archive_tag : "",
      archive_description: typeof d.archive_description === "string" ? d.archive_description : "",
      archive_cta_label: typeof d.archive_cta_label === "string" ? d.archive_cta_label : "",
      archive_cta_url: typeof d.archive_cta_url === "string" ? d.archive_cta_url : "",
      items,
    };
  }
);

/**
 * Deduplicated, server-only public VIP Sanctuary Section fetcher.
 */
export const getVipSanctuarySection = cache(
  async (): Promise<PublicVipSanctuarySection | null> => {
    const origin = getBackendOrigin();
    const url = `${origin}/api/v1/home/vip-sanctuary/`;

    let res: Response;
    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Backend unavailable at ${origin}: ${message}`);
    }

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch VIP sanctuary section: HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      success?: boolean;
      data?: PublicVipSanctuarySection;
    };
    if (!json || json.success !== true || !json.data) {
      throw new Error("Invalid VIP sanctuary response payload.");
    }

    const d = json.data;
    return {
      background_image: d.background_image || null,
      eyebrow: typeof d.eyebrow === "string" ? d.eyebrow : "",
      title: typeof d.title === "string" ? d.title : "",
      description: typeof d.description === "string" ? d.description : "",
      value_pillars: Array.isArray(d.value_pillars) ? d.value_pillars : [],
      primary_cta_label: typeof d.primary_cta_label === "string" ? d.primary_cta_label : "",
      primary_cta_action: d.primary_cta_action || "appointment_modal",
      primary_cta_url: d.primary_cta_url || "",
      secondary_cta_label: typeof d.secondary_cta_label === "string" ? d.secondary_cta_label : "",
      secondary_cta_url: d.secondary_cta_url || "",
      card_badge: typeof d.card_badge === "string" ? d.card_badge : "",
      card_title: typeof d.card_title === "string" ? d.card_title : "",
      card_live_pill: typeof d.card_live_pill === "string" ? d.card_live_pill : "",
      location_text: typeof d.location_text === "string" ? d.location_text : null,
      hours_text: typeof d.hours_text === "string" ? d.hours_text : null,
      phone_text: typeof d.phone_text === "string" ? d.phone_text : null,
      whatsapp_cta_label: typeof d.whatsapp_cta_label === "string" ? d.whatsapp_cta_label : "",
      whatsapp_url: typeof d.whatsapp_url === "string" ? d.whatsapp_url : "",
      tour_cta_label: typeof d.tour_cta_label === "string" ? d.tour_cta_label : "",
      tour_video_target: d.tour_video_target || "tour",
    };
  }
);

/**
 * Deduplicated, server-only public About Section fetcher.
 */
export const getAboutSection = cache(async (): Promise<PublicAboutSection | null> => {
  const origin = getBackendOrigin();
  const url = `${origin}/api/v1/home/about/`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { success?: boolean; data?: PublicAboutSection };
    if (!json || json.success !== true || !json.data) {
      return null;
    }
    return json.data;
  } catch (error) {
    console.error("[getAboutSection] Failed to fetch about section:", error);
    return null;
  }
});

// ----------------- SEO Configs (apps.seo_config: SEOConfig & CategoryPageSEO) -----------------

export const getPageSEO = cache(async (page: string): Promise<PublicPageSEO | null> => {
  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/v1/site-config/seo/${encodeURIComponent(page)}/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
});

export const getCategorySEO = cache(async (category: string): Promise<PublicCategorySEO | null> => {
  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/v1/site-config/category-seo/${encodeURIComponent(category)}/`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch {
    return null;
  }
});
export const getAllPageSEO = cache(async (): Promise<PublicPageSEO[]> => {
  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/v1/site-config/seo/`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data || json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
});

export const getAllCategorySEO = cache(async (): Promise<PublicCategorySEO[]> => {
  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/v1/site-config/category-seo/`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json?.data || json;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
});

export function buildMetadataFromSEO(
  seo: PublicPageSEO | PublicCategorySEO | PublicBrandSEO | null,
  fallback: Metadata
): Metadata {
  if (!seo || ("visibility" in seo && seo.visibility === "HIDDEN")) {
    return fallback;
  }

  const title = seo.meta_title || fallback.title || undefined;
  const description = seo.meta_description || fallback.description || undefined;
  const canonicalUrl = seo.canonical_url || fallback.alternates?.canonical || undefined;

  let robots = fallback.robots;
  if (seo.robots) {
    const lower = seo.robots.toLowerCase();
    const isNoIndex = lower.includes("noindex");
    const isNoFollow = lower.includes("nofollow");
    robots = {
      index: !isNoIndex,
      follow: !isNoFollow,
    };
  }

  const keywords = "meta_keywords" in seo && typeof seo.meta_keywords === "string" && seo.meta_keywords.trim()
    ? seo.meta_keywords.split(",").map((k) => k.trim())
    : fallback.keywords;

  const ogTitle = ("og_title" in seo && seo.og_title) || seo.meta_title || fallback.openGraph?.title;
  const ogDescription = ("og_description" in seo && seo.og_description) || seo.meta_description || fallback.openGraph?.description;
  const ogImage = ("og_image" in seo && seo.og_image) || ("feature_image" in seo && seo.feature_image) || ("image" in seo && seo.image) || undefined;
  const ogType = ("og_type" in seo && seo.og_type === "article" ? "article" : "website") as "website" | "article";
  const ogSiteName = ("og_site_name" in seo && seo.og_site_name) || "DREAM CAR HOUSE";

  const twitterTitle = ("twitter_title" in seo && seo.twitter_title) || seo.meta_title || fallback.twitter?.title;
  const twitterDescription = ("twitter_description" in seo && seo.twitter_description) || seo.meta_description || fallback.twitter?.description;
  const twitterImage = ("twitter_image" in seo && seo.twitter_image) || ogImage;

  return {
    ...fallback,
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl as string,
    },
    robots,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl as string,
      siteName: ogSiteName,
      type: ogType,
      images: ogImage ? [{ url: ogImage, alt: ("feature_image_alt" in seo && seo.feature_image_alt) || ("logo_alt" in seo && seo.logo_alt) || "" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}


import type { PublicShowroomStory } from "@/lib/types";

export const getShowroomStoriesSSR = cache(async (): Promise<PublicShowroomStory[]> => {
  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/v1/home/stories/`, {
      next: { revalidate: 60, tags: ["showroom-stories"] },
    });
    if (!res.ok) {
      console.warn(`[getShowroomStoriesSSR] Failed with HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data as PublicShowroomStory[];
    }
    return [];
  } catch (err) {
    console.warn("[getShowroomStoriesSSR] Network or fetch error:", err);
    return [];
  }
});
