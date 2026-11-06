import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./dream-car-house.css";
import { UIProvider } from "@/lib/UIContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalContainer from "@/components/ModalContainer";
import FloatingSupercarTop from "@/components/FloatingSupercarTop";

import { fetchLayoutData, getShowroomStoriesSSR, defaultSiteSettings, defaultBranches } from "@/lib/server/api";
import { VEHICLE_DATA } from "@/lib/showroomData";
import type { PublicSiteSettings, PublicShowroomBranch, PublicVehicle } from "@/lib/types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050608",
};

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "DREAM CAR HOUSE";
  let siteTagline = "The Pinnacle of Luxury Automobiles";
  let siteWebsite = "https://dreamcarhouse.com";

  try {
    const { settings } = await fetchLayoutData();
    siteName = settings.name || siteName;
    siteTagline = settings.tagline || siteTagline;
    siteWebsite = settings.website || siteWebsite;
  } catch {
    // Falls back safely if during initial build
  }

  return {
    metadataBase: new URL(siteWebsite),
    title: {
      default: `${siteTagline} | ${siteName}`,
      template: `%s | ${siteName}`,
    },
    description: `Explore luxury cars in Bangladesh with ${siteName}. Browse our exclusive range of brand new, reconditioned, and pre-owned premium vehicles in Kakrail and Gulshan, Dhaka.`,
    alternates: {
      canonical: siteWebsite,
    },
    openGraph: {
      title: `${siteTagline} | ${siteName}`,
      description: `Explore luxury cars in Bangladesh with ${siteName}.`,
      url: siteWebsite,
      siteName: siteName,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteTagline} | ${siteName}`,
      description: `Explore luxury cars in Bangladesh with ${siteName}.`,
    },
    icons: {
      icon: "/favicon.ico",
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

  const autoDealerSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.name,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
    telephone: settings.hotline || settings.phone,
    email: settings.email,
    url: settings.website,
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
