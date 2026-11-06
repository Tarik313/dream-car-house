import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPublicBrands, getPublicInventory } from "@/lib/server/api";

export const metadata: Metadata = {
  title: "Official Luxury Marques & Automotive Brands | DREAM CAR HOUSE",
  description:
    "Explore prestigious automotive brands at DREAM CAR HOUSE Dhaka showrooms: Mercedes-Benz, BMW, Porsche, Rolls-Royce, Bentley, Lexus, Land Rover, and Toyota.",
  alternates: {
    canonical: "https://dreamcarhouse.com/cars/brand/",
  },
  openGraph: {
    title: "Official Luxury Marques & Automotive Brands | DREAM CAR HOUSE",
    description: "Explore prestigious automotive brands at DREAM CAR HOUSE Dhaka showrooms.",
    url: "https://dreamcarhouse.com/cars/brand/",
    siteName: "DREAM CAR HOUSE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Luxury Marques & Automotive Brands | DREAM CAR HOUSE",
    description: "Explore prestigious automotive brands at DREAM CAR HOUSE Dhaka showrooms.",
  },
};

export const dynamic = "force-dynamic";

export default async function BrandsDirectoryPage() {
  const [allBrands, inventoryRes] = await Promise.all([
    getAllPublicBrands().catch(() => []),
    getPublicInventory().catch(() => ({ items: [] })),
  ]);

  const vehicles = inventoryRes.items || [];

  // Count vehicles by brand name
  const vehicleCountMap = new Map<string, number>();
  for (const car of vehicles) {
    if (car.brand) {
      const b = car.brand.trim().toLowerCase();
      vehicleCountMap.set(b, (vehicleCountMap.get(b) || 0) + 1);
    }
  }

  // Build complete marques directory from official database brands
  const brandsList = allBrands.map((b) => {
    const slug = b.slug || b.name.toLowerCase().replace(/[\s_]+/g, "-");
    const count = vehicleCountMap.get(b.name.trim().toLowerCase()) || (b.car_names?.length || 0);
    return {
      id: b.id,
      name: b.name,
      slug,
      image: b.image || "",
      logo_alt: b.logo_alt || `${b.name} Luxury Marque`,
      segment: b.segment || "Luxury Marque",
      startingPrice: b.starting_price,
      count,
    };
  });

  // Breadcrumbs schema
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
    ],
  };

  return (
    <div className="inventory-page-wrap max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.75rem", fontSize: "0.85rem", color: "#9ca3af" }}>
        <Link href="/" style={{ color: "#d1d5db", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 0.5rem", color: "#6b7280" }}>/</span>
        <Link href="/inventory" style={{ color: "#d1d5db", textDecoration: "none" }}>Inventory</Link>
        <span style={{ margin: "0 0.5rem", color: "#6b7280" }}>/</span>
        <span style={{ color: "#ffffff", fontWeight: 600 }}>Marques</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <span className="preference-badge" style={{ marginBottom: "0.35rem", display: "inline-block" }}>
          OFFICIAL LUXURY MARQUES
        </span>
        <h1 className="section-h2" style={{ marginBottom: "0.5rem", fontSize: "2.25rem" }}>
          Prestigious Brand Portfolios
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "0.95rem", maxWidth: "700px", lineHeight: 1.6 }}>
          Select an automotive marque to explore dedicated flagship inventory, bespoke zero-meter import commissions, and showroom allocations at our Kakrail and Gulshan vaults.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {brandsList.map((brand) => (
          <Link
            key={brand.slug}
            href={`/cars/brand/${brand.slug}`}
            className="brand-card-box group"
            style={{
              background: "linear-gradient(180deg, #111317 0%, #0d0f12 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "160px",
              textDecoration: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                    marginBottom: "0.35rem",
                  }}
                >
                  {brand.segment}
                </span>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  {brand.name}
                </h3>
              </div>
              {brand.image && (
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={brand.image}
                    alt={brand.logo_alt}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <span style={{ fontSize: "0.85rem", color: brand.count > 0 ? "#10b981" : "#9ca3af" }}>
                {brand.count > 0 ? `${brand.count} In Showroom` : "Bespoke Import Available"}
              </span>
              <span style={{ fontSize: "1.1rem", color: "#d4af37", transition: "transform 0.2s ease" }}>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
