import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Car | DREAM CAR HOUSE - Premium Showroom Valuation",
  description:
    "Want to sell your luxury vehicle? Submit your car details to DREAM CAR HOUSE for verified market valuation and immediate seamless settlement.",
  robots: "index, follow",
  alternates: {
    canonical: "https://dreamcarhouse.com/sell/",
  },
  openGraph: {
    title: "Sell Your Car | DREAM CAR HOUSE",
    description:
      "Submit your vehicle details to DREAM CAR HOUSE and get the best valuation for your car.",
    url: "https://dreamcarhouse.com/sell/",
    type: "website",
    siteName: "DREAM CAR HOUSE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Your Car | DREAM CAR HOUSE",
    description:
      "Submit your vehicle details to DREAM CAR HOUSE and get the best price for your car.",
  },
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
