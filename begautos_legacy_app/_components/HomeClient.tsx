// app/_components/HomeClient.tsx
"use client";

import CarouselSection from "@/components/ui/CarouselSection";
import LogoCarouselSection from "@/components/ui/LogoCarouselSection";
import Link from "next/link";
import Appointment from "../Appointment";
import BestShowroom from "../BestShowroom";
import FooterHero from "../FooterHero";
import Hero from "../Hero";
import MultipleInventory from "../MultipleInventory";
import Social from "../Social";

type Car = {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  engine_capacity: string;
  fuel_type: string;
  mileage: string;
  price: string;
  feature_image: string;
  slug?: string;
};

type Brand = {
  id: number;
  name: string;
  image: string;
};

type SocialItem = {
  image: string;
  title: string;
  url: string;
  is_featured: boolean;
};

export default function HomeClient({
  sliderData,
  featuredCars,
  brands,
  socialData,
}: {
  sliderData: { heading: string; image: string } | null;
  featuredCars: Car[];
  brands: Brand[];
  socialData: SocialItem[];
}) {
  return (
    <div className="dream-home w-full">
      {/* Hero Section */}
      <Hero sliderData={sliderData} />
      <div className="container-responsive">
        <MultipleInventory />
        {/* Available Cars Now Section */}
        <section className="py-6 sm:py-3 md:py-4 lg:py-8 px-4 sm:px-6 ">
          <div className="max-w-7xl mx-auto w-full">
            {/* Title and See All link */}
            <div
              className="flex flex-col sm:flex-row justify-between
            items-start sm:items-center mb-6 sm:mb-3 md:mb-4 lg:mb-7 gap-4 sm:gap-0"
              id="carousel-section"
            >
              <h2 className="text-[32px] sm:text-2xl md:text-3xl font-medium text-ink">
                Current Inventory
              </h2>
              <Link
                href="/cars"
                className="text-muted hover:text-muted transition-colors duration-200 text-sm sm:text-base"
              >
                See All
              </Link>
            </div>

            {/* Car Carousel */}
            <div className="w-full overflow-hidden">
              <CarouselSection cars={featuredCars} />
            </div>
          </div>
        </section>

        <LogoCarouselSection brands={brands} />
        <Appointment />
        <BestShowroom />
        <Social socialData={socialData} />
      </div>
      <FooterHero />
    </div>
  );
}
