// app/cars/[slug]/CarDetailClient.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronUp, Phone } from "lucide-react";
import FormOverlay from "@/app/FormOverlay";
import RelatedCarsCarousel from "@/app/RelatedCarsCarousel";
import ShareButton from "./ShareButton";

interface CarImage {
  id: number;
  image: string;
  caption?: string;
  alt_text?: string;
  order?: number;
}

interface Car {
  id: number;
  slightly_negotiable: 'YES' | 'NO';
  name: string;
  brand: string;
  model: string;
  year: number;
  mileage: string;
  engine_capacity: string;
  transmission: string;
  fuel_type: string;
  drive_type: string;
  wheel_base: string;
  color: string;
  body_style: string;
  condition: string;
  price: number | string | null;
  description: string;
  youtube: string;
  registered: string;
  feature_image: string;
  inventory_images: CarImage[];
  // SEO fields
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  featured_image_alt?: string;
  indexing?: string;
  h1_title?: string;
  target_keyword?: string;
  schema_data?: Record<string, unknown>;
}

export interface ContactInfoData {
  name: string;
  phone_number: string;
}

interface CarDetailClientProps {
  slug: string;
  initialCar: Car | null;
}

function formatBDT(amount: number) {
  const takaSymbol = "BDT";
  const numStr = amount.toString();
  const [integer] = numStr.split(".");

  const lastThree = integer.slice(-3);
  const otherNumbers = integer.slice(0, -3);
  const formattedInteger = otherNumbers
    ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;

  return `${takaSymbol} ${formattedInteger}`;
}

function getEmbedUrl(url: string) {
  if (!url) return "";
  const videoId = url.includes("watch?v=")
    ? url.split("watch?v=")[1]
    : url.split("/").pop();
  return `https://www.youtube.com/embed/${videoId}`;
}

export default function CarDetailClient({ slug, initialCar }: CarDetailClientProps) {
  const [car, setCar] = useState<Car | null>(initialCar);
  const [loading, setLoading] = useState(!initialCar);
  const [error, setError] = useState<string | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [get_a_call, set_get_a_call] = useState(false);
  const [contactInfo, setContactInfro] = useState<ContactInfoData[]>();
  const relevantContacts = contactInfo?.filter((item) =>
  car?.brand === "BYD"
    ? item.name?.toUpperCase().includes("[BYD]")
    : !item.name?.toUpperCase().includes("[BYD]")
  );

  const [showVideo, setShowVideo] = useState(false);

  const openImagePopup = (index: number) => {
    setCurrentImageIndex(index);
    setShowImagePopup(true);
  };
  const closePopup = () => {
    setShowImagePopup(false);
  };
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    (async function () {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/home/sales-representative/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch car details");
      }

      const result = await response.json();
      if (result?.success) {
        setContactInfro(result.data);
      }
    })();
  }, []);

  useEffect(() => {
    if (initialCar || !slug) return;

    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/inventory/detail/${slug}/`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch car details");
        }

        const data = await response.json();

        if (data.success) {
          setCar(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch car details");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching car details:", err);
        } else {
          setError("An unknown error occurred");
          console.error("Unknown error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetail();
  }, [slug, initialCar]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-line"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-panel text-ink px-4 py-2 rounded hover:bg-soft"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  // Prepare images array — sorted by order
  const images = [...car.inventory_images].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const formattedPrice =
  car?.price === "Sold"
    ? "Sold"
    : car?.price === "Pre-Order"
    ? "Available for Pre-Order"
    : car?.price
    ? formatBDT(car?.price as number)
    : "Contact for price";

  let slightly_negotiable = <></>;
  if (car?.slightly_negotiable?.toString().trim().toUpperCase() === "YES") {
    slightly_negotiable = (
      <p className="text-muted text-sm mb-6">
        *Price may be slightly negotiable
      </p>
    );
  }

  return (
    <div className="dream-detail bg-page text-ink min-h-screen container-responsive mx-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex text-sm text-muted mb-6 mt-20">
          <Link href="/" className="hover:text-muted">
            Home &nbsp;
          </Link>{" "}
          {" / "}
          <Link href="/cars" className="hover:text-muted">
            &nbsp; Cars&nbsp;
          </Link>{" "}
          {" / "}
          <span className="text-ink "> &nbsp;{car.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-12  rounded-[10px] overflow-hidden">
          <div className="relative overflow-hidden cursor-pointer aspect-[4/3]">
            {images[0] && (
              <Image
                src={images[0]?.image ?? "/images/placeholder.png"}
                alt={images[0]?.alt_text || car.featured_image_alt || car.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
                onClick={() => openImagePopup(0)}
                priority
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 cursor-pointer ">
            {images.slice(1, 5).map((img, index) => (
              <div
                key={img.id}
                className="relative overflow-hidden cursor-pointer aspect-[4/3]"
                onClick={() => openImagePopup(index + 1)}
              >
                <Image
                  src={img?.image ?? "/images/placeholder.png"}
                  alt={img.alt_text || img.caption || car.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
                  className="object-cover"
                />
                {index === 3 && images.length > 5 && (
                  <div className="dream-media absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
                    <span className="text-ink text-lg sm:text-xl font-semibold tracking-wide">
                      More
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-10 mt-4">
          <h1 className="text-4xl font-bold text-ink">
            {car.h1_title || car.name}
          </h1>
          <ShareButton
            url={
              typeof window !== "undefined"
                ? window.location.href
                : `https://www.begautos.com/cars/${car.slug}`
            }
            title={car.name}
          />
        </div>
        {/* Sidebar Only show in mobile */}
        <div className="lg:col-span-1 block md:hidden mb-6">
          <div className="sticky top-4 space-y-6">
            <div className="p-6 rounded-lg border border-line">
              <h2 className="text-3xl font-bold text-ink mb-2">
                {formattedPrice}
              </h2>
              {slightly_negotiable}
              <div className="mb-6">
                <h3 className="text-ink mb-2 font-medium">
                  Need help making a choice?
                </h3>
                <p className="text-muted text-sm">
                  Our expert sales team is here to assist you to choose your
                  vehicle according to your necessity, choice & preference.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => {
                      if (relevantContacts && relevantContacts?.length > 0) {
                        set_get_a_call(true);
                      }
                    }}
                    className={`w-full bg-accent text-ink font-bold rounded-lg hover:bg-accent-hover transition-opacity cursor-pointer ${
                      get_a_call
                        ? "opacity-0 pointer-events-none scale-90 py-0 px-0"
                        : "opacity-100 scale-100 py-3 px-4"
                    }`}
                    style={{ transition: "0.5s" }}
                  >
                    Call Us
                  </button>

                  <div
                    className={`bg-soft text-ink rounded-xl w-full ${
                      get_a_call
                        ? "opacity-100 scale-100 max-h-[500px] p-4 pb-8 space-y-3 -mt-5"
                        : "opacity-0 scale-95 max-h-0 overflow-hidden"
                    }`}
                    style={{ transition: "0.5s" }}
                  >
                    <h2
                      onClick={() => {
                        set_get_a_call(false);
                      }}
                      className="text-sm font-medium text-muted mb-4 flex justify-between items-center cursor-pointer
                        "
                    >
                      Senior Sales Representative
                      <ChevronUp className="text-muted mr-2 w-5 h-5 inline-block" />
                    </h2>

                    {relevantContacts?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-line px-3 py-2 transition"
                      >
                        <span className="text-sm tracking-wide">
                          {item?.phone_number}
                        </span>
                        <a
                          href={`tel:${item?.phone_number}`}
                          className="text-muted hover:text-ink"
                        >
                          <Phone size={16} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.open(
                      "https://wa.me/8801966900600",
                      "WhatsApp",
                      "width=700,height=800,top=100,left=200"
                    );
                  }}
                  className="bg-accent hover:bg-accent-hover w-full transition-colors duration-300 text-ink font-medium py-3 px-4 rounded-lg cursor-pointer"
                >
                  Text Us on Whatsapp
                </button>
                <FormOverlay carId={car?.id} />
              </div>
            </div>

            {/* Contact */}
            <button
              onClick={() => {
                window.open(
                  "https://calendly.com/begautos-sales/",
                  "calendlyPopup",
                  "width=700,height=800,top=100,left=200"
                );
              }}
              className="p-2 rounded-lg bg-soft hover:bg-panel transition cursor-pointer w-full"
            >
              <div className="w-full text-center rounded-[5px] font-bold py-3 px-4">
                Book an Appointment
              </div>
            </button>
          </div>
        </div>
        {/* Car Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 ">
            {/* Specs grid moved up */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-8 bg-soft rounded-[21px] px-4 py-6">
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Brand</p>
                <p className="text-ink font-medium">{car.brand}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Model</p>
                <p className="text-ink font-medium">{car.model}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Reg. Year</p>
                <p className="text-ink font-medium">{car.year}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Mileage</p>
                <p className="text-ink font-medium">{car.mileage}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Engine (CC)</p>
                <p className="text-ink font-medium">{car.engine_capacity}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Transmission</p>
                <p className="text-ink font-medium">{car.transmission}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Fuel Type</p>
                <p className="text-ink font-medium">{car.fuel_type}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Drive Type</p>
                <p className="text-ink font-medium">{car.drive_type}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Wheel</p>
                <p className="text-ink font-medium">{car.wheel_base}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Exterior</p>
                <p className="text-ink font-medium">{car.color}</p>
              </div>
              <div className=" p-4 rounded-lg">
                <p className="text-muted text-sm">Body Style</p>
                <p className="text-ink font-medium">{car.body_style}</p>
              </div>
            </div>
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ink mb-4">
                Description
              </h2>
              <div
                className="text-muted leading-relaxed"
                dangerouslySetInnerHTML={{ __html: car.description }}
              />
            </div>

            {/* Highlights section */}
            <div>
              {images[20] && (
                <h2 className="text-2xl font-bold text-ink mb-4">
                  Highlights
                </h2>
              )}

              <div className="space-y-4">
                {/* First Row - One large square */}
                {images[20] && (
                  <div className="aspect-[4/3]">
                    <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer">
                      <Image
                        src={images[20]?.image}
                        alt={images[20]?.alt_text || images[20]?.caption || car?.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="dream-media absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-sm text-ink">
                          {images[20]?.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Second Row - 1/3 + 2/3, both squares */}
                {(images[21] || images[22]) && (
                  <div className="grid grid-cols-3 gap-4">
                    {images[21] && (
                      <div className="col-span-1 aspect-[1/2.05]">
                        <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer">
                          <Image
                            src={images[21]?.image}
                            alt={images[21]?.alt_text || images[21]?.caption || car?.name}
                            fill
                            sizes="(max-width: 768px) 33vw, 200px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="dream-media absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-sm text-ink">
                              {images[21]?.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {images[22] && (
                      <div
                        className={`${
                          images[22] ? "col-span-2" : "col-span-3"
                        } aspect-[1/1]`}
                      >
                        <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer">
                          <Image
                            src={images[22]?.image}
                            alt={images[22]?.alt_text || images[22]?.caption || car?.name}
                            fill
                            sizes="(max-width: 768px) 66vw, 400px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="dream-media absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-sm text-ink">
                              {images[22]?.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Third Row - 2/3 + 1/3, both squares */}
                {(images[23] || images[24]) && (
                  <div className="grid grid-cols-3 gap-4">
                    {images[23] && (
                      <div
                        className={`${
                          images[23] ? "col-span-2" : "col-span-3"
                        } aspect-[1/1]`}
                      >
                        <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer">
                          <Image
                            src={images[23]?.image}
                            alt={images[23]?.alt_text || images[23]?.caption || car?.name}
                            fill
                            sizes="(max-width: 768px) 66vw, 400px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="dream-media absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-sm text-ink">
                              {images[23]?.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {images[24] && (
                      <div className="col-span-1 aspect-[1/2.05]">
                        <div className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer">
                          <Image
                            src={images[24]?.image}
                            alt={images[24]?.alt_text || images[24]?.caption || car?.name}
                            fill
                            sizes="(max-width: 768px) 33vw, 200px"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="dream-media absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-sm text-ink">
                              {images[24]?.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show message if no images available */}
                {images?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted">
                      No images available for this vehicle.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video section */}
            {car?.youtube && (
              <div className="my-8">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  {showVideo ? (
                    <iframe
                      className="w-full h-full"
                      src={getEmbedUrl(car?.youtube)}
                      title="Car Video"
                      frameBorder="1"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <button
                        onClick={() => setShowVideo(true)}
                        className="rounded-full bg-red bg-opacity-10 p-4 hover:bg-opacity-20 transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-ink"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 23a8 8 0 100-21 8 8 0 000 21zM9.555 7.223A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar for desktop */}
          <div className="lg:col-span-1 hidden md:block">
            <div className="sticky top-4 space-y-6">
              <div className="p-6 rounded-lg border border-line">
                <h2 className="text-3xl font-bold text-ink mb-2">
                  {formattedPrice}
                </h2>
                {slightly_negotiable}

                <div className="mb-6">
                  <h3 className="text-ink mb-2 font-medium">
                    Need help making a choice?
                  </h3>
                  <p className="text-muted text-sm">
                    Our expert sales team is here to assist you to choose your
                    vehicle according to your necessity, choice & preference.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <button
                      onClick={() => {
                        if (relevantContacts && relevantContacts?.length > 0) {
                          set_get_a_call(true);
                        }
                      }}
                      className={`w-full bg-accent text-ink font-bold rounded-lg hover:bg-accent-hover transition-opacity cursor-pointer ${
                        get_a_call
                          ? "opacity-0 pointer-events-none scale-90 py-0 px-0"
                          : "opacity-100 scale-100 py-3 px-4"
                      }`}
                      style={{ transition: "0.5s" }}
                    >
                     Call Us
                    </button>

                    <div
                      className={`bg-soft text-ink rounded-xl w-full ${
                        get_a_call
                          ? "opacity-100 scale-100 max-h-[500px] p-4 pb-8 space-y-3 -mt-5"
                          : "opacity-0 scale-95 max-h-0 overflow-hidden"
                      }`}
                      style={{ transition: "0.5s" }}
                    >
                      <h2
                        onClick={() => {
                          set_get_a_call(false);
                        }}
                        className="text-sm font-medium text-muted mb-4 flex justify-between items-center cursor-pointer
                        "
                      >
                        Senior Sales Representative
                        <ChevronUp className="text-muted mr-2 w-5 h-5 inline-block" />
                      </h2>

                      {relevantContacts?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-line px-3 py-2 transition"
                        >
                          <span className="text-sm tracking-wide">
                            {item?.phone_number}
                          </span>
                          <a
                            href={`tel:${item?.phone_number}`}
                            className="text-muted hover:text-ink"
                          >
                            <Phone size={16} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      window.open(
                        "https://wa.me/8801966900600",
                        "WhatsApp",
                        "width=700,height=800,top=100,left=200"
                      );
                    }}
                    className="bg-accent hover:bg-accent-hover w-full transition-colors duration-300 text-ink font-medium py-3 px-4 rounded-lg cursor-pointer"
                  >
                    Text Us on WhatsApp
                  </button>
                  <FormOverlay carId={car?.id} />
                </div>
              </div>

              {/* Contact */}
              <button
                onClick={() => {
                  window.open(
                    "https://calendly.com/begautos-sales/",
                    "calendlyPopup",
                    "width=700,height=800,top=100,left=200"
                  );
                }}
                className="p-2 rounded-lg bg-soft hover:bg-panel transition cursor-pointer w-full"
              >
                <div className="w-full text-center rounded-[5px] font-bold py-3 px-4">
                  Book an Appointment
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Related Cars */}
        <div className="mt-21">
          <h2 className="text-3xl font-bold text-ink mb-6">
            Suggested for you
          </h2>
          {car?.slug && <RelatedCarsCarousel carSlug={car.slug} />}
        </div>
        {showImagePopup && (
          <div
            className="dream-lightbox dream-media fixed w-full inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center animate-fadeIn"
            style={{
              animation: "fadeIn 0.3s ease-in-out",
            }}
          >
            <div
              className="relative lg:max-w-7xl max-w-4xl w-full h-full p-4 animate-slideUp"
              style={{
                animation: "slideUp 0.4s ease-out 0.1s both",
              }}
            >
              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-30 right-4 text-ink text-2xl hover:text-muted transition-all duration-200 z-10 bg-page bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center transform hover:scale-110 hover:rotate-90 opacity-0 animate-fadeIn"
                style={{
                  animation: "fadeIn 0.3s ease-in-out 0.3s both",
                }}
              >
                &times;
              </button>

              {/* Main image container */}
              <div className="relative h-full flex items-center justify-center">
                {/* Previous button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink text-3xl hover:text-muted transition-all duration-200 z-10 sm:bg-page bg-opacity-50 rounded-full md:w-12 md:h-12 flex items-center justify-center hover:scale-110 hover:bg-opacity-70 opacity-0 animate-slideInLeft"
                  style={{
                    animation: "slideInLeft 0.4s ease-out 0.2s both",
                  }}
                >
                  &lt;
                </button>

                {/* Image */}
                <div
                  className="relative w-full  h-full opacity-0 animate-zoomIn"
                  style={{
                    animation: "zoomIn 0.5s ease-out 0.2s both",
                  }}
                >
                  <Image
                    src={images[currentImageIndex].image}
                    alt={images[currentImageIndex].alt_text || images[currentImageIndex].caption || car.name}
                    fill
                    sizes="100vw"
                    className="object-contain sm:w-full w-[350px] transition-opacity duration-300 ease-in-out"
                    key={currentImageIndex}
                  />
                </div>

                {/* Next button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ink text-3xl hover:text-muted transition-all duration-200 z-10 sm:bg-page bg-opacity-50 rounded-full md:w-12 md:h-12 flex items-center justify-center hover:scale-110 hover:bg-opacity-70 opacity-0 animate-slideInRight"
                  style={{
                    animation: "slideInRight 0.4s ease-out 0.2s both",
                  }}
                >
                  &gt;
                </button>
              </div>

              {/* Image counter */}
              <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-ink text-sm bg-page bg-opacity-50 px-3 py-1 rounded opacity-0 animate-slideUp"
                style={{
                  animation: "slideUp 0.4s ease-out 0.4s both",
                }}
              >
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
