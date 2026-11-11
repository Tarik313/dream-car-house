import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  defaultSiteSettings,
  getPublicInventoryDetail,
  getPublicRelatedVehicles,
  getSiteSettings,
} from "@/lib/server/api";
import { buildCarSeo, cleanText, getPublicBaseUrl, normalizeCanonicalUrl } from "@/lib/seo";
import VehicleDetailClient from "./VehicleDetailClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [car, settings] = await Promise.all([
    getPublicInventoryDetail(slug),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  if (!car) {
    return {
      title: "Vehicle Not Found | DREAM CAR HOUSE",
      robots: { index: false, follow: false },
    };
  }

  const carSeo = buildCarSeo(car, { settings });
  const siteName = cleanText(settings.name) || "DREAM CAR HOUSE";

  let robotsConfig: Metadata["robots"] = undefined;
  if (car.indexing) {
    const idx = car.indexing.toLowerCase();
    if (idx.includes("noindex")) {
      robotsConfig = { index: false, follow: !idx.includes("nofollow") };
    } else if (idx.includes("index")) {
      robotsConfig = { index: true, follow: !idx.includes("nofollow") };
    }
  }

  return {
    title: carSeo.title,
    description: carSeo.description,
    robots: robotsConfig,
    alternates: {
      canonical: carSeo.canonicalUrl,
    },
    openGraph: {
      title: carSeo.ogTitle,
      description: carSeo.ogDescription,
      url: carSeo.ogUrl,
      siteName,
      type: "article",
      images: [
        {
          url: carSeo.ogImage,
          width: 1200,
          height: 630,
          alt: carSeo.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: carSeo.twitterTitle,
      description: carSeo.twitterDescription,
      images: [carSeo.twitterImage],
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const car = await getPublicInventoryDetail(slug);

  if (!car) {
    notFound();
  }

  // Canonical slug redirect: if requested slug is an old slug or casing mismatch
  if (car.slug && car.slug.toLowerCase() !== slug.toLowerCase()) {
    permanentRedirect(`/cars/${car.slug}/`);
  }

  const [relatedCars, settings] = await Promise.all([
    getPublicRelatedVehicles(car.slug).catch(() => []),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);
  const carSeo = buildCarSeo(car, { settings });
  const baseUrl = getPublicBaseUrl(settings?.website);

  // Parse numeric price safely
  const numericPrice = car.raw_price ? parseFloat(car.raw_price) : null;
  const hasValidNumericPrice = numericPrice !== null && !isNaN(numericPrice) && numericPrice > 0;

  // Determine stock availability without inventing
  let schemaAvailability: string | undefined = undefined;
  const reg = (car.registered || "").toLowerCase();
  if (reg === "available") {
    schemaAvailability = "https://schema.org/InStock";
  } else if (reg === "sold") {
    schemaAvailability = "https://schema.org/SoldOut";
  } else if (reg === "booked") {
    schemaAvailability = "https://schema.org/SoldOut";
  } else if (reg === "pre-order") {
    schemaAvailability = "https://schema.org/PreOrder";
  }

  // Build Offer object strictly complying with Schema.org
  const offerObj: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "BDT",
    url: carSeo.canonicalUrl,
    seller: {
      "@type": "AutoDealer",
      name: cleanText(settings?.name) || "DREAM CAR HOUSE",
      address: car.branch_address,
      telephone: "+880 1615-121312",
    },
  };

  if (hasValidNumericPrice) {
    offerObj.price = numericPrice;
  }
  if (schemaAvailability) {
    offerObj.availability = schemaAvailability;
  }

  // Structured Data Schema for Car
  const carSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: car.name,
    model: car.model,
    brand: {
      "@type": "Brand",
      name: car.brand,
    },
    vehicleModelDate: car.year ? car.year.toString() : undefined,
    fuelType: carSeo.fuelTypeText || car.fuel_type,
    color: cleanText(car.color) || undefined,
    vehicleTransmission: cleanText(car.transmission) || undefined,
    bodyType: cleanText(car.body_style) || undefined,
    driveWheelConfiguration: cleanText(car.drivetrain) || undefined,
    mileageFromOdometer: carSeo.mileageText
      ? {
          "@type": "QuantitativeValue",
          value: carSeo.mileageText,
          unitCode: "KMT",
        }
      : undefined,
    image: carSeo.ogImage,
    description: carSeo.jsonLdDescription,
    offers: offerObj,
  };

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
        name: "Inventory",
        item: normalizeCanonicalUrl("/inventory/", baseUrl),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: car.name,
        item: carSeo.canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VehicleDetailClient car={car} relatedCars={relatedCars} settings={settings || undefined} />
    </>
  );
}
