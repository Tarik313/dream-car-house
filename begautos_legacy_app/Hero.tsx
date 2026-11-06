"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SliderData {
  heading: string;
  image: string; // This will be the video URL
}

const FALLBACK_HERO_VIDEO = "/videos/hero-bg.mp4";

export default function Hero({
  sliderData,
}: {
  sliderData: SliderData | null;
}) {
  const resolvedSliderData = sliderData ?? {
    heading: "Finest Luxury Car Studio",
    image: FALLBACK_HERO_VIDEO,
  };

  const [videoSrc, setVideoSrc] = useState(resolvedSliderData.image);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoSrc(resolvedSliderData.image || FALLBACK_HERO_VIDEO);
    setVideoFailed(false);
  }, [resolvedSliderData.image]);

  return (
    <section className="dream-hero dream-media relative flex">
      {/* Background video from API */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!videoFailed && videoSrc && (
          <video
            key={videoSrc}
            className="w-full h-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={(e) => {
              if (videoSrc !== FALLBACK_HERO_VIDEO) {
                setVideoSrc(FALLBACK_HERO_VIDEO);
                return;
              }

              console.error("Video failed to load:", resolvedSliderData.image);
              setVideoFailed(true);

              const videoElement = e.target as HTMLVideoElement;
              videoElement.style.display = "none";
              if (videoElement.parentElement) {
                videoElement.parentElement.style.backgroundColor = "#1f2937";
              }
            }}
          />
        )}
        {videoFailed && <div className="absolute inset-0 bg-slate-900" />}
        <div className="dream-hero-shade absolute inset-0 z-10" />
      </div>

      {/* Hero content with dynamic heading */}
      <div className="dream-hero-content z-10">
        <h1 className="dream-hero-title">
          {resolvedSliderData.heading}
        </h1>

        <div className="dream-hero-actions">
          <Link
            href="/cars/brand-new"
            className="hero-circle-btn group"
          >
            <div className="hero-circle-btn-text">
              <p className="m-0">New</p>
            </div>
            <div className="hero-circle-btn-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </Link>

          <Link
            href="/cars/pre-owned"
            className="hero-circle-btn group"
          >
            <div className="hero-circle-btn-text">
              <p className="m-0">Reconditions</p>
            </div>
            <div className="hero-circle-btn-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* SVG Scroll Indicator */}
        <a
          href="#carousel-section"
          aria-label="Explore current inventory"
          className="absolute bottom-10 md:bottom-4 left-1/2 -translate-x-1/2 animate-bounce arrow-down"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M19.281 14.0306L12.531 20.7806C12.4614 20.8504 12.3787 20.9057 12.2876 20.9434C12.1966 20.9812 12.099 21.0006 12.0004 21.0006C11.9019 21.0006 11.8043 20.9812 11.7132 20.9434C11.6222 20.9057 11.5394 20.8504 11.4698 20.7806L4.71979 14.0306C4.57906 13.8899 4.5 13.699 4.5 13.501C4.5 13.301 4.57906 13.1101 4.71979 12.9694C4.86052 12.8286 5.05139 12.7496 5.25042 12.7496C5.44944 12.7496 5.64031 12.8286 5.78104 12.9694L11.2504 18.4397V3.75C11.2504 3.55109 11.3294 3.36032 11.4701 3.21967C11.6107 3.07902 11.8015 3 12.0004 3C12.1993 3 12.3901 3.07902 12.5307 3.21967C12.6714 3.36032 12.7504 3.55109 12.7504 3.75V18.4397L18.2198 12.9694C18.3605 12.8286 18.5514 12.7496 18.7504 12.7496C18.9494 12.7496 19.1403 12.8286 19.281 12.9694C19.4218 13.1101 19.5008 13.301 19.5008 13.5C19.5008 13.699 19.4218 13.8899 19.281 14.0306Z"
              fill="white"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
