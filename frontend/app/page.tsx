import type { Metadata } from "next";
import type {
  PublicHeroSlider,
  PublicVehicle,
  PublicPreferenceSection,
  PublicBrand,
  PublicConsultationSection,
  PublicExperienceSection,
  PublicVisualChroniclesSection,
  PublicVipSanctuarySection,
} from "@/lib/types";
import Hero from "@/components/Hero";
import InventoryCarousel from "@/components/InventoryCarousel";
import PreferenceSection from "@/components/PreferenceSection";
import BrandRunway from "@/components/BrandRunway";
import ConnectConsult from "@/components/ConnectConsult";
import ExperiencePillars from "@/components/ExperiencePillars";
import VisualChronicles from "@/components/VisualChronicles";
import VipSanctuary from "@/components/VipSanctuary";
import {
  getHeroSlider,
  getFeaturedInventory,
  getPublicInventory,
  getPreferenceSection,
  getRunwayBrands,
  getConsultationSection,
  getExperienceSection,
  getVisualChroniclesSection,
  getVipSanctuarySection,
  getPageSEO,
  getSiteSettings,
  defaultSiteSettings,
  buildMetadataFromSEO,
} from "@/lib/server/api";
import { buildCleanPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [hero, seo, settings] = await Promise.all([
    getHeroSlider().catch(() => null),
    getPageSEO("home").catch(() => null),
    getSiteSettings().catch(() => defaultSiteSettings),
  ]);

  const fallbackTitle = hero?.heading
    ? hero.heading
    : "The Pinnacle of Luxury Automobiles";
  const description =
    "Explore luxury cars in Bangladesh with DREAM CAR HOUSE. Browse our exclusive range of brand new, reconditioned, and pre-owned premium vehicles in Kakrail and Gulshan, Dhaka.";
  const ogDescription =
    "Experience dedicated automotive advisory across our Kakrail and Gulshan showrooms.";

  const fallback = buildCleanPageMetadata({
    title: fallbackTitle,
    description,
    ogTitle: fallbackTitle,
    ogDescription,
    twitterTitle: fallbackTitle,
    twitterDescription: ogDescription,
    path: "/",
    settings,
  });

  return buildMetadataFromSEO(seo, fallback, settings);
}

export default async function HomePage() {
  let heroData: PublicHeroSlider | null = null;
  let featuredCars: PublicVehicle[] = [];
  let allPublishedCars: PublicVehicle[] = [];
  let preferenceSectionData: PublicPreferenceSection | null = null;
  let runwayBrands: PublicBrand[] = [];
  let consultationData: PublicConsultationSection | null = null;
  let experienceData: PublicExperienceSection | null = null;
  let chroniclesData: PublicVisualChroniclesSection | null = null;
  let sanctuaryData: PublicVipSanctuarySection | null = null;

  try {
    const [hero, featured, inventory, preference, brands, consultation, experience, chronicles, sanctuary] =
      await Promise.all([
        getHeroSlider().catch(() => null),
        getFeaturedInventory().catch(() => []),
        getPublicInventory().catch(() => ({ items: [] })),
        getPreferenceSection().catch(() => null),
        getRunwayBrands().catch(() => []),
        getConsultationSection().catch(() => null),
        getExperienceSection().catch(() => null),
        getVisualChroniclesSection().catch(() => null),
        getVipSanctuarySection().catch(() => null),
      ]);
    heroData = hero;
    featuredCars = featured;
    allPublishedCars = inventory.items;
    preferenceSectionData = preference;
    runwayBrands = brands;
    consultationData = consultation;
    experienceData = experience;
    chroniclesData = chronicles;
    sanctuaryData = sanctuary;
  } catch (error) {
    console.error("[HomePage] Failed to fetch homepage data:", error);
  }

  const carouselVehicles = featuredCars.length > 0 ? featuredCars : allPublishedCars;

  return (
    <div id="view-home">
      {/* 1. Hero Flagship Cinema */}
      <Hero initialData={heroData} />

      {/* 2. Current Inventory Carousel */}
      <InventoryCarousel vehicles={carouselVehicles} />

      {/* 3. Studio Preference Switcher (Brand New vs Certified Pre-Owned) */}
      <PreferenceSection
        vehicles={allPublishedCars}
        sectionData={preferenceSectionData}
      />

      {/* 4. Prestigious Automotive Marques Runway */}
      <BrandRunway brands={runwayBrands} />

      {/* 5. Private Automotive Concierge: Connect to Consult */}
      <ConnectConsult consultation={consultationData} />

      {/* 6. Experience Beyond Ordinary: 3 Atelier Pillars */}
      <ExperiencePillars experience={experienceData} />

      {/* 7. Showroom Atelier Visual Chronicles (Interactive 3D Flip Cards) */}
      <VisualChronicles chronicles={chroniclesData} />

      {/* 8. VIP Showroom Invitation & Private Sanctuary Suite */}
      <VipSanctuary sanctuary={sanctuaryData} />
    </div>
  );
}

