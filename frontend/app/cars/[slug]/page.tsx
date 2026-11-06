import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublicInventoryDetail, getPublicRelatedVehicles, getSiteSettings } from "@/lib/server/api";
import VehicleDetailClient from "./VehicleDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await getPublicInventoryDetail(slug);

  if (!car) {
    return {
      title: "Vehicle Not Found | DREAM CAR HOUSE",
      robots: { index: false, follow: false },
    };
  }

  const title = car.meta_title || `${car.name} (${car.year}) | DREAM CAR HOUSE`;
  const description =
    car.meta_description ||
    `${car.name} ${car.year} in Bangladesh. ${car.engine_capacity}, ${car.mileage}, ${car.fuel_type}. Available at ${car.branch_name}.`;
  const canonical = car.canonical_url || `https://dreamcarhouse.com/cars/${car.slug}/`;

  let robotsConfig: Metadata["robots"] = undefined;
  if (car.indexing) {
    const idx = car.indexing.toLowerCase();
    if (idx.includes("noindex")) {
      robotsConfig = { index: false, follow: !idx.includes("nofollow") };
    } else if (idx.includes("index")) {
      robotsConfig = { index: true, follow: !idx.includes("nofollow") };
    }
  }

  const alt = car.featured_image_alt || `${car.name} (${car.year}) Stance`;

  return {
    title,
    description,
    robots: robotsConfig,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [
        {
          url: car.image,
          width: 1200,
          height: 630,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [car.image],
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
    getPublicRelatedVehicles(car.slug),
    getSiteSettings().catch(() => null),
  ]);

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
    url: car.canonical_url || `https://dreamcarhouse.com/cars/${car.slug}/`,
    seller: {
      "@type": "AutoDealer",
      name: "DREAM CAR HOUSE",
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
    fuelType: car.fuel_type,
    color: car.color,
    vehicleTransmission: car.transmission,
    bodyType: car.body_style,
    driveWheelConfiguration: car.drivetrain,
    mileageFromOdometer: car.mileage
      ? {
          "@type": "QuantitativeValue",
          value: car.mileage,
          unitCode: "KMT",
        }
      : undefined,
    image: car.image,
    description: car.meta_description || car.description,
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
        item: "https://dreamcarhouse.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Inventory",
        item: "https://dreamcarhouse.com/inventory/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: car.name,
        item: `https://dreamcarhouse.com/cars/${car.slug}/`,
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
