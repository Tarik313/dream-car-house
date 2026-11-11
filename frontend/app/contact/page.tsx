import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import {
  resolveSeoPageMetadata,
  getShowroomBranches,
  getSiteSettings,
  getSalesRepresentatives,
} from "@/lib/server/api";

export async function generateMetadata(): Promise<Metadata> {
  return resolveSeoPageMetadata({
    key: "contact",
    kind: "page",
    fallback: {
      title: "Location & Showroom Contact • Kakrail & Gulshan",
      description:
        "Visit DREAM CAR HOUSE at 18 Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka and Gulshan Avenue. Call 01615-121312 for VIP luxury vehicle consultations.",
      path: "/contact/",
    },
  });
}

export default async function ContactPage() {
  const [branches, settings, salesReps] = await Promise.all([
    getShowroomBranches().catch(() => []),
    getSiteSettings().catch(() => null),
    getSalesRepresentatives().catch(() => []),
  ]);
  return <ContactClient branches={branches} settings={settings} salesReps={salesReps} />;
}
