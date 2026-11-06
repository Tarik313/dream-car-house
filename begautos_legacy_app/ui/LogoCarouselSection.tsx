"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Brand { id: number; name: string; image: string; }

export default function LogoCarouselSection({ brands }: { brands: Brand[] }) {
  const mediaBase = process.env.NEXT_PUBLIC_SITE_URL || "https://www.begautos.com";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const logosPerSlide = 7;
  const totalSlides = Math.ceil(brands.length / logosPerSlide);
  useEffect(() => {
    if (totalSlides < 2) return;
    const interval = setInterval(() => setCurrentSlide((previous) => (previous + 1) % totalSlides), 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);
  const getVisibleLogos = () => {
    const start = (currentSlide % Math.max(1, totalSlides)) * logosPerSlide;
    return brands.slice(start, start + logosPerSlide);
  };
  return (
    <section className="dream-brands">
      <h2 className="mb-8">Explore Our Brands</h2>
      {brands.length ? (
        <>
          <div className="dream-brand-grid">
            {getVisibleLogos().map((brand) => (
              <div key={brand.id} className="dream-brand-tile">
                <div className="relative w-20 h-20">
                  {brand.image && !failedImages.has(brand.id) ? (
                    <Image
                      src={brand.image.startsWith("http") ? brand.image : `${mediaBase}${brand.image}`}
                      alt={`${brand.name} logo`} fill sizes="80px" className="object-contain"
                      onError={() => setFailedImages((previous) => new Set(previous).add(brand.id))}
                    />
                  ) : <span className="text-muted">{brand.name}</span>}
                </div>
                <span>{brand.name}</span>
              </div>
            ))}
          </div>
          {totalSlides > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-accent" : "bg-soft"}`}
                  aria-label={`Go to brand slide ${index + 1}`} aria-pressed={currentSlide === index} />
              ))}
            </div>
          )}
        </>
      ) : <p className="text-muted">No brands available yet.</p>}
    </section>
  );
}
