import type { Metadata } from "next";
import SellClient from "./SellClient";
import { getPageSEO, buildMetadataFromSEO, getSiteSettings } from "@/lib/server/api";

const fallbackMetadata: Metadata = {
  title: "Sell Your Luxury Car & Trade-In Valuation | DREAM CAR HOUSE",
  description:
    "Confidential valuation and trade-in services for your luxury car in Bangladesh. Direct acquisition, rapid appraisal, and certified verification at DREAM CAR HOUSE.",
  alternates: {
    canonical: "https://dreamcarhouse.com/sell/",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("sell");
  return buildMetadataFromSEO(seo, fallbackMetadata);
}

export default async function SellPage() {
  const settings = await getSiteSettings();
  return <SellClient settings={settings} />;
}
