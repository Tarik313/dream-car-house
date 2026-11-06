"use client";
import VehicleCard from "@/components/ui/VehicleCard";
import { useRef } from "react";
import Slider from "react-slick";

// Define the car type based on the API response
interface Car {
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
}

export default function CarouselSection({ cars }: { cars: Car[] }) {
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: true,
    infinite: cars.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, Math.max(1, cars.length)),
    slidesToScroll: 1,
    arrows: false, // already false, just keep it
    autoplay: true, // ✅ enable autoplay
    autoplaySpeed: 3000, // ✅ slide every 3 seconds (change as needed)
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, Math.max(1, cars.length)),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, Math.max(1, cars.length)),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (!cars.length) {
    return <div className="text-center py-10">No cars available</div>;
  }

  return (
    <div className="dream-carousel relative">
      <Slider ref={sliderRef} {...settings}>
        {cars.map((car) => (
          <div key={car.id} className="px-3">
            <VehicleCard car={car} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
