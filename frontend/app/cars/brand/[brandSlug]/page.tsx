import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getBrandSEODetail,
  getPublicInventory,
  getSiteSettings,
  buildMetadataFromSEO,
} from "@/lib/server/api";
import BrandVehiclesClient from "./BrandVehiclesClient";

interface PageProps {
  params: Promise<{
    brandSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug } = await params;
  const brandSeo = await getBrandSEODetail(brandSlug);

  if (!brandSeo) {
    return {
      title: "Marque Not Found | DREAM CAR HOUSE",
      robots: { index: false, follow: false },
    };
  }

  const brandName = brandSeo.name;
  const canonicalUrl =
    brandSeo.canonical_url || `https://dreamcarhouse.com/cars/brand/${brandSeo.slug || brandSlug}/`;

  const fallback: Metadata = {
    title: `${brandName} Luxury Vehicles for Sale in Bangladesh | DREAM CAR HOUSE`,
    description: `Explore verified ${brandName} luxury vehicles at DREAM CAR HOUSE showrooms in Kakrail and Gulshan, Dhaka. Browse brand new zero-meter and certified pre-owned ${brandName} models with transparent provenance.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${brandName} Luxury Vehicles Collection | DREAM CAR HOUSE`,
      description: `Explore factory-fresh and certified pre-owned ${brandName} luxury motorcars in Bangladesh.`,
      url: canonicalUrl,
      siteName: "DREAM CAR HOUSE",
      type: "website",
      images: brandSeo.feature_image
        ? [
            {
              url: brandSeo.feature_image,
              alt: brandSeo.feature_image_alt || `${brandName} Collection`,
              width: 1200,
              height: 630,
            },
          ]
        : brandSeo.image
        ? [
            {
              url: brandSeo.image,
              alt: brandSeo.logo_alt || `${brandName} Logo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${brandName} Luxury Vehicles Collection | DREAM CAR HOUSE`,
      description: `Explore factory-fresh and certified pre-owned ${brandName} luxury motorcars in Bangladesh.`,
      images: brandSeo.feature_image ? [brandSeo.feature_image] : brandSeo.image ? [brandSeo.image] : undefined,
    },
  };

  return buildMetadataFromSEO(brandSeo, fallback);
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
    getSiteSettings().catch(() => null),
  ]);

  const matchingCars = invRes.items || [];
  const canonicalUrl =
    brandSeo.canonical_url || `https://dreamcarhouse.com/cars/brand/${brandSeo.slug || brandSlug}/`;

  // 1. Structured Data: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://dreamcarhouse.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Marques",
        item: "https://dreamcarhouse.com/cars/brand/",
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
      ...(brandSeo.image ? { logo: brandSeo.image } : {}),
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matchingCars.length,
      itemListElement: matchingCars.map((car, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://dreamcarhouse.com/cars/${car.slug}/`,
        name: car.name,
        ...(car.image ? { image: car.image } : {}),
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
