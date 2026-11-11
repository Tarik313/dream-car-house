import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  defaultSiteSettings,
  getBrandSEODetail,
  getPublicInventory,
  getSiteSettings,
  buildMetadataFromSEO,
} from "@/lib/server/api";
import {
  buildCleanPageMetadata,
  getPublicBaseUrl,
  normalizeCanonicalUrl,
  resolvePublicUrl,
} from "@/lib/seo";
import BrandVehiclesClient from "./BrandVehiclesClient";

export const revalidate = 300;

interface PageProps {
  params: Promise<{
    brandSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug } = await params;
  const [brandSeo, settings] = await Promise.all([
    getBrandSEODetail(brandSlug),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  if (!brandSeo) {
    return {
      title: "Marque Not Found | DREAM CAR HOUSE",
      robots: { index: false, follow: false },
    };
  }

  const brandName = brandSeo.name;
  const canonicalUrl = normalizeCanonicalUrl(
    brandSeo.canonical_url || `/cars/brand/${brandSeo.slug || brandSlug}/`,
    settings.website
  );

  const fallback = buildCleanPageMetadata({
    title: `${brandName} Luxury Vehicles for Sale in Bangladesh`,
    description: `Explore verified ${brandName} luxury vehicles at DREAM CAR HOUSE showrooms in Kakrail and Gulshan, Dhaka. Browse brand new zero-meter and certified pre-owned ${brandName} models with transparent provenance.`,
    ogTitle: `${brandName} Luxury Vehicles Collection`,
    ogDescription: `Explore factory-fresh and certified pre-owned ${brandName} luxury motorcars in Bangladesh.`,
    ogImage: brandSeo.feature_image || brandSeo.image || undefined,
    path: canonicalUrl,
    settings,
  });

  return buildMetadataFromSEO(brandSeo, fallback, settings);
}

export default async function BrandVehiclesPage({ params }: PageProps) {
  const { brandSlug } = await params;
  const brandSeo = await getBrandSEODetail(brandSlug);

  if (!brandSeo) {
    notFound();
  }

  // Enforce canonical slug casing if needed
  if (brandSeo.slug && brandSeo.slug !== brandSlug) {
    permanentRedirect(`/cars/brand/${brandSeo.slug}/`);
  }

  const [invRes, settings] = await Promise.all([
    getPublicInventory({ brand: brandSeo.name }).catch(() => ({ items: [], totalRows: 0 })),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  const matchingCars = invRes.items || [];
  const baseUrl = getPublicBaseUrl(settings?.website);
  const canonicalUrl = normalizeCanonicalUrl(
    brandSeo.canonical_url || `/cars/brand/${brandSeo.slug || brandSlug}/`,
    baseUrl
  );

  // 1. Structured Data: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: normalizeCanonicalUrl("/", baseUrl),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Marques",
        item: normalizeCanonicalUrl("/cars/brand/", baseUrl),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brandSeo.name,
        item: canonicalUrl,
      },
    ],
  };

  // 2. Structured Data: CollectionPage
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brandSeo.h1_title || `${brandSeo.name} Luxury Vehicles`,
    description:
      brandSeo.meta_description ||
      `Explore official ${brandSeo.name} luxury vehicle inventory at DREAM CAR HOUSE Dhaka showrooms.`,
    url: canonicalUrl,
    about: {
      "@type": "Brand",
      name: brandSeo.name,
      ...(brandSeo.image ? { logo: resolvePublicUrl(brandSeo.image, baseUrl) } : {}),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matchingCars.length,
      itemListElement: matchingCars.map((car, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: normalizeCanonicalUrl(`/cars/${car.slug}/`, baseUrl),
        name: car.name,
        ...(car.image ? { image: resolvePublicUrl(car.image, baseUrl) } : {}),
      })),
    },
  };

  return (
    <>
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Schema.org CollectionPage & Brand ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Custom Admin Schema JSON (Configured in Dashboard) */}
      {brandSeo.schema_json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSeo.schema_json) }}
        />
      )}

      <BrandVehiclesClient
        brandSeo={brandSeo}
        cars={matchingCars}
        settings={settings}
      />
    </>
  );
}
