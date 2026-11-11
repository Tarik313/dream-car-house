import type { Metadata } from "next";
import SellClient from "./SellClient";
import {
  defaultSiteSettings,
  getSiteSettings,
  resolveSeoPageMetadata,
} from "@/lib/server/api";

export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoPageMetadata({
    key: "sell",
    kind: "page",
    fallback: {
      title: "Sell Your Luxury Car & Trade-In Valuation",
      description:
        "Confidential valuation and trade-in services for your luxury car in Bangladesh. Direct acquisition, rapid appraisal, and certified verification at DREAM CAR HOUSE.",
      path: "/sell/",
    },
  });
}

export default async function SellPage() {
  const settings = await getSiteSettings().catch(() => defaultSiteSettings);
  return <SellClient settings={settings} />;
}
