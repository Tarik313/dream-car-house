import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import {
  getPageSEO,
  buildMetadataFromSEO,
  getSiteSettings,
  defaultSiteSettings,
  getShowroomBranches,
  getPublicInventory,
  getAboutSection,
  getPeopleTalks,
} from "@/lib/server/api";
import { buildCleanPageMetadata, getDefaultOgImage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, aboutData, settings] = await Promise.all([
    getPageSEO("about").catch(() => null),
    getAboutSection().catch(() => null),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  const title = aboutData?.hero_title
    ? `${aboutData.hero_title} • The Showroom Legacy`
    : "About Us • The Showroom Legacy & Provenance";
  const ogTitle = aboutData?.hero_title
    ? aboutData.hero_title
    : "About DREAM CAR HOUSE • The Showroom Legacy";
  const description =
    aboutData?.hero_subtitle ||
    "Learn about DREAM CAR HOUSE, Dhaka's premier luxury automotive destination with flagship showrooms in Kakrail and Gulshan, Dhaka.";
  const ogDescription =
    aboutData?.hero_subtitle ||
    "Dhaka's benchmark in factory-fresh zero-meter imports, bespoke executive saloons, and confidential white-glove automotive advisory.";

  const fallbackMetadata = buildCleanPageMetadata({
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage: aboutData?.reel_image_url || undefined,
    path: "/about/",
    settings,
  });

  return buildMetadataFromSEO(seo, fallbackMetadata, settings);
}

export default async function AboutPage() {
  const [settings, branches, inventory, aboutData, peopleTalks] = await Promise.all([
    getSiteSettings().catch(() => null),
    getShowroomBranches().catch(() => []),
    getPublicInventory().catch(() => ({ items: [], totalRows: 0 })),
    getAboutSection().catch(() => null),
    getPeopleTalks().catch(() => []),
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
              item: "https://dreamcarhouse.com/",
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
        url: "https://dreamcarhouse.com/",
        logo: getDefaultOgImage(settings),
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
        peopleTalks={peopleTalks}
      />
    </>
  );
}
