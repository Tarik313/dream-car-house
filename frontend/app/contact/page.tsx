import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getPageSEO, buildMetadataFromSEO, getShowroomBranches, getSiteSettings } from "@/lib/server/api";

const fallbackMetadata: Metadata = {
  title: "Location & Showroom Contact • Kakrail & Gulshan | DREAM CAR HOUSE",
  description:
    "Visit DREAM CAR HOUSE at 18 Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka and Gulshan Avenue. Call 01615-121312 for VIP luxury vehicle consultations.",
  alternates: {
    canonical: "https://dreamcarhouse.com/contact/",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("contact");
  return buildMetadataFromSEO(seo, fallbackMetadata);
}

export default async function ContactPage() {
  const [branches, settings] = await Promise.all([
    getShowroomBranches().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);
  return <ContactClient branches={branches} settings={settings} />;
}
