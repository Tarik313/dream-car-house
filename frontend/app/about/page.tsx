import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import {
  getPageSEO,
  buildMetadataFromSEO,
  getSiteSettings,
  getShowroomBranches,
  getPublicInventory,
  getAboutSection,
} from "@/lib/server/api";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, aboutData] = await Promise.all([
    getPageSEO("about").catch(() => null),
    getAboutSection().catch(() => null),
  ]);

  const fallbackMetadata: Metadata = {
    title: aboutData?.hero_title
      ? `${aboutData.hero_title} • The Showroom Legacy | DREAM CAR HOUSE`
      : "About Us • The Showroom Legacy & Provenance | DREAM CAR HOUSE",
    description:
      aboutData?.hero_subtitle ||
      "Learn about DREAM CAR HOUSE, Dhaka's premier luxury automotive destination with flagship showrooms in Kakrail and Gulshan, Dhaka.",
    alternates: {
      canonical: "https://dreamcarhouse.com/about/",
    },
    openGraph: {
      title: aboutData?.hero_title
        ? `${aboutData.hero_title} | DREAM CAR HOUSE`
        : "About DREAM CAR HOUSE • The Showroom Legacy",
      description:
        aboutData?.hero_subtitle ||
        "Dhaka's benchmark in factory-fresh zero-meter imports, bespoke executive saloons, and confidential white-glove automotive advisory.",
      url: "https://dreamcarhouse.com/about/",
      images: [
        {
          url: aboutData?.reel_image_url || "/assets/dch-logo.webp",
          width: 1200,
          height: 630,
          alt: "DREAM CAR HOUSE Flagship Luxury Showroom",
        },
      ],
    },
  };

  return buildMetadataFromSEO(seo, fallbackMetadata);
}

export default async function AboutPage() {
  const [settings, branches, inventory, aboutData] = await Promise.all([
    getSiteSettings().catch(() => null),
    getShowroomBranches().catch(() => []),
    getPublicInventory().catch(() => ({ items: [], totalRows: 0 })),
    getAboutSection().catch(() => null),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://dreamcarhouse.com/about/#webpage",
        url: "https://dreamcarhouse.com/about/",
        name: aboutData?.hero_title || "About DREAM CAR HOUSE",
        description:
          aboutData?.hero_subtitle ||
          "Dhaka's premier luxury automotive destination with flagship showrooms in Kakrail and Gulshan, Dhaka.",
        breadcrumb: {
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
              name: "About Us",
              item: "https://dreamcarhouse.com/about/",
            },
          ],
        },
      },
      {
        "@type": "AutoDealer",
        "@id": "https://dreamcarhouse.com/#dealer",
        name: "DREAM CAR HOUSE",
        url: "https://dreamcarhouse.com",
        logo: "https://dreamcarhouse.com/assets/dch-logo.webp",
        description:
          aboutData?.story_content_p1 ||
          "Dhaka's benchmark in factory-fresh zero-meter imports, bespoke executive saloons, and confidential white-glove automotive advisory.",
        telephone: settings?.hotline || "+8801700000000",
        address: branches.map((b) => ({
          "@type": "PostalAddress",
          streetAddress: b.address,
          addressLocality: "Dhaka",
          addressCountry: "BD",
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient
        aboutData={aboutData}
        settings={settings || undefined}
        branches={branches}
        totalVehicles={inventory.totalRows || inventory.items.length}
      />
    </>
  );
}
