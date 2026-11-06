import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Gallery | DREAM CAR HOUSE - Flagship Collection & Showroom Chronicles",
  description:
    "Browse the DREAM CAR HOUSE luxury gallery showcasing our curated collection of exotic supercars, luxury SUVs, and executive sedans in Dhaka, Bangladesh.",
  robots: "index, follow",
  alternates: {
    canonical: "https://dreamcarhouse.com/gallery/",
  },
  openGraph: {
    title: "Gallery | DREAM CAR HOUSE",
    description:
      "Browse the DREAM CAR HOUSE gallery showcasing our stunning vehicle collection.",
    url: "https://dreamcarhouse.com/gallery/",
    type: "website",
    siteName: "DREAM CAR HOUSE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery | DREAM CAR HOUSE",
    description:
      "Browse the DREAM CAR HOUSE gallery showcasing our stunning vehicle collection.",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
