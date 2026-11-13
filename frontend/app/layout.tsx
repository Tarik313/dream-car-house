import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./dream-car-house.css";
import { UIProvider } from "@/lib/UIContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalContainer from "@/components/ModalContainer";
import FloatingSupercarTop from "@/components/FloatingSupercarTop";

import {
  fetchLayoutData,
  getShowroomStoriesSSR,
  getSiteSettings,
  defaultSiteSettings,
  defaultBranches,
} from "@/lib/server/api";
import {
  cleanText,
  formatTitleWithSite,
  getDefaultOgImage,
  getPublicBaseUrl,
  normalizeCanonicalUrl,
  resolvePublicUrl,
} from "@/lib/seo";
import { VEHICLE_DATA } from "@/lib/showroomData";
import type { PublicSiteSettings, PublicShowroomBranch, PublicVehicle } from "@/lib/types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050608",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => defaultSiteSettings);
  const siteName = cleanText(settings.name) || "DREAM CAR HOUSE";
  const siteTagline = cleanText(settings.tagline) || "The Pinnacle of Luxury Automobiles";
  const baseUrl = getPublicBaseUrl(settings.website);
  const canonicalUrl = normalizeCanonicalUrl("/", baseUrl);
  const defaultOgImage = resolvePublicUrl("/assets/dch-og-preview.jpg", baseUrl);
  const faviconUrl = resolvePublicUrl(cleanText(settings.favicon) || "/favicon.ico", baseUrl);
  const fullTitle = formatTitleWithSite(siteTagline, siteName);
  const description = `Explore luxury cars in Bangladesh with ${siteName}. Browse our exclusive range of brand new, reconditioned, and pre-owned premium vehicles in Kakrail and Gulshan, Dhaka.`;

  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: `${siteName} — ${siteTagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [defaultOgImage],
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let layoutData: { settings: PublicSiteSettings; branches: PublicShowroomBranch[]; featuredVehicles: PublicVehicle[] } | null = null;

  try {
    layoutData = await fetchLayoutData();
  } catch {
    layoutData = null;
  }

  const settings = layoutData?.settings ?? defaultSiteSettings;
  const branches = layoutData?.branches && layoutData.branches.length > 0 ? layoutData.branches : defaultBranches;
  const featuredVehicles =
    layoutData?.featuredVehicles && layoutData.featuredVehicles.length > 0
      ? layoutData.featuredVehicles
      : (VEHICLE_DATA.slice(0, 10) as unknown as PublicVehicle[]);
  const stories = await getShowroomStoriesSSR().catch(() => []);

  const baseUrl = getPublicBaseUrl(settings.website);
  const autoDealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.name,
    image: getDefaultOgImage(settings, baseUrl),
    telephone: settings.hotline || settings.phone,
    email: settings.email,
    url: normalizeCanonicalUrl("/", baseUrl),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.primary_address,
      addressLocality: "Dhaka",
      postalCode: "1000",
      addressCountry: "BD",
    },
    openingHours: settings.opening_hours_text,
  };

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerSchema) }}
        />
      </head>
      <body className="bg-black text-white font-poppins">
        <UIProvider>
          <Header settings={settings} />
          <main id="main-content">{children}</main>
          <Footer settings={settings} branches={branches} />
          <ModalContainer
            settings={settings}
            branches={branches}
            featuredVehicles={featuredVehicles}
            stories={stories}
          />
          <FloatingSupercarTop />
        </UIProvider>
      </body>
    </html>
  );
}
