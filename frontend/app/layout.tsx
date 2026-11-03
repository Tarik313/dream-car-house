import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./dream-car-house.css";
import { UIProvider } from "@/lib/UIContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModalContainer from "@/components/ModalContainer";

import { fetchLayoutData, getShowroomStoriesSSR } from "@/lib/server/api";
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
  let layoutError: string | null = null;

  try {
    layoutData = await fetchLayoutData();
  } catch (err: unknown) {
    layoutError = err instanceof Error ? err.message : String(err);
  }

  // Handle root-layout data failures with an explicit error response; do not fall back to embedded defaults
  if (layoutError || !layoutData) {
    return (
      <html lang="en" className={poppins.variable}>
        <body className="bg-black text-white font-poppins min-h-screen flex flex-col items-center justify-center p-6">
          <div className="max-w-xl w-full bg-red-950/20 border border-red-500/40 rounded-xl p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h1 className="text-xl font-bold tracking-wide">Business Content Unavailable</h1>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              The public website could not load verified database site settings and showroom branch content from the Django backend. Hardcoded defaults and silent localhost fallbacks are strictly prohibited.
            </p>
            <div className="bg-black/80 border border-red-900/50 rounded p-3 font-mono text-xs text-red-300 break-words mb-4">
              {layoutError || "Unknown layout data failure."}
            </div>
            <p className="text-xs text-slate-500">
              Please verify that the Django backend server is running and that site settings have been seeded.
            </p>
          </div>
        </body>
      </html>
    );
  }

  const { settings, branches, featuredVehicles } = layoutData;
  const stories = await getShowroomStoriesSSR();

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
        </UIProvider>
      </body>
    </html>
  );
}
