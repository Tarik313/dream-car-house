"use client";
import VehicleCard from "@/components/ui/VehicleCard";
import { useEffect, useRef, useState } from "react";
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

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total_page: number;
    current_page: number;
    pagesize: number;
    total_rows: number;
    next: string | null;
    previous: string | null;
    results: Car[];
  };
}

interface RelatedCarsCarouselProps {
  carId?: number;
  carSlug?: string;
}

export default function RelatedCarsCarousel({
  carId,
  carSlug,
}: RelatedCarsCarouselProps) {
  const sliderRef = useRef<Slider>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedCars = async () => {
      try {
        setIsLoading(true);
        const identifier = carSlug || carId;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/inventory/detail/${identifier}/related/`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch related cars");
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.data.results) {
          setCars(data.data.results);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching related cars:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (carId || carSlug) {
      fetchRelatedCars();
    }
  }, [carId, carSlug]);

  const settings = {
    dots: true,
    infinite: cars.length > 1, // Only enable infinite when more than 1 car
    speed: 500,
    slidesToShow: Math.min(4, Math.max(1, cars.length)),
    slidesToScroll: 1,
    arrows: false,
    autoplay: cars.length > 1, // Only autoplay when more than 1 car
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, Math.max(1, cars.length)),
          infinite: cars.length > 1,
          autoplay: cars.length > 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, Math.max(1, cars.length)),
          infinite: cars.length > 1,
          autoplay: cars.length > 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          infinite: cars.length > 1,
          autoplay: cars.length > 1,
        },
      },
    ],
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading related cars...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  if (!cars.length) {
    return <div className="text-center py-10">No related cars available</div>;
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
