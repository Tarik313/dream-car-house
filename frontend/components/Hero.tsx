"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useUI } from "@/lib/UIContext";
import type { PublicHeroSlider, PublicHeroCta } from "@/lib/types";

interface HeroProps {
  initialData?: PublicHeroSlider | null;
}

function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId || !urlOrId.trim()) return null;
  const str = urlOrId.trim();
  if (!str.includes("http") && !str.includes("/")) return str;
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function Hero({ initialData }: HeroProps = {}) {
  const { theme, openAppointmentModal } = useUI();

  const heading = initialData?.heading;
  const ctaButtons: PublicHeroCta[] = initialData?.cta_buttons || [];

  // Dual Showroom Background Images (Day vs Night)
  const nightSrc =
    initialData?.image && !initialData.image.includes("maybach") && !/\.(mp4|webm|mov|m4v)$/i.test(initialData.image)
      ? initialData.image
      : (initialData?.poster_night || "/assets/dch-night-showroom.webp");

  const daySrc =
    initialData?.image_day ||
    (initialData?.poster && !initialData.poster.includes("maybach")
      ? initialData.poster
      : "/assets/dch-day-showroom.webp");

  // Mode check: if media_type is explicitly "image", do NOT render video
  const isPhotoMode = initialData?.media_type === "image";

  // Check if a video is provided
  const uploadedVideo =
    !isPhotoMode && initialData?.image && /\.(mp4|webm|mov|m4v)$/i.test(initialData.image)
      ? initialData.image
      : null;

  const directVideoUrl =
    !isPhotoMode && initialData?.video_provider === "direct" && initialData?.video_source?.trim()
      ? initialData.video_source.trim()
      : null;

  const youtubeId =
    !isPhotoMode && initialData?.video_provider === "youtube" && initialData?.video_source?.trim()
      ? extractYouTubeId(initialData.video_source)
      : null;

  const vimeoId =
    !isPhotoMode && initialData?.video_provider === "vimeo" && initialData?.video_source?.trim()
      ? initialData.video_source.trim()
      : null;

  const hasVideo = !isPhotoMode && Boolean(uploadedVideo || directVideoUrl || youtubeId || vimeoId);

  return (
    <section
      className={`hero-showcase-section ${theme === "dark" ? "theme-dark" : "theme-light"}`}
      id="hero-section"
      aria-label="DREAM CAR HOUSE Flagship Luxury Showroom"
    >
      {/* Background Container */}
      <div className="hero-bg-container" aria-hidden="true">
        {hasVideo ? (
          <div
            className="hero-bg-video-wrapper"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {uploadedVideo || directVideoUrl ? (
              <video
                src={uploadedVideo || directVideoUrl || ""}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={theme === "dark" ? nightSrc : daySrc}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                title={initialData?.video_title || "DREAM CAR HOUSE Cinema"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100vw",
                  height: "56.25vw",
                  minHeight: "100%",
                  minWidth: "177.77vh",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  border: "none",
                }}
              />
            ) : vimeoId ? (
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&autopause=0`}
                title={initialData?.video_title || "DREAM CAR HOUSE Cinema"}
                allow="autoplay; fullscreen"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100vw",
                  height: "56.25vw",
                  minHeight: "100%",
                  minWidth: "177.77vh",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  border: "none",
                }}
              />
            ) : null}
          </div>
        ) : (
          /* ================= Dual Showroom Background Images (Day vs Night) ================= */
          <>
            {/* Night Showroom */}
            <div className={`hero-bg-layer hero-bg-night ${theme === "dark" ? "is-active" : "is-inactive"}`}>
              <Image
                src={nightSrc}
                alt="DREAM CAR HOUSE Night Luxury Showroom - Pinnacle of Luxury Automobiles"
                fill
                priority
                unoptimized
                className="hero-bg-image"
              />
            </div>

            {/* Day Showroom */}
            <div className={`hero-bg-layer hero-bg-day ${theme === "light" ? "is-active" : "is-inactive"}`}>
              <Image
                src={daySrc}
                alt="DREAM CAR HOUSE Day Luxury Showroom - Pinnacle of Luxury Automobiles"
                fill
                priority
                unoptimized
                className="hero-bg-image"
              />
            </div>
          </>
        )}
      </div>

      {heading || ctaButtons.length > 0 || initialData?.scroll_link_label ? (
        <div className="hero-content">
          {heading ? <h1 className="hero-title sr-only">{heading}</h1> : null}
          {ctaButtons.length > 0 && (
            <div className="hero-pills">
              {ctaButtons.map((btn, index) => {
                if (btn.action === "appointment_modal") {
                  return (
                    <button
                      key={index}
                      className="hero-pill-btn"
                      onClick={() => openAppointmentModal()}
                    >
                      {btn.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={index}
                    className="hero-pill-btn"
                    href={btn.destination || "/"}
                  >
                    {btn.label}
                  </Link>
                );
              })}
            </div>
          )}
          {initialData?.scroll_link_label ? (
            <div className="hero-scroll-cue-wrap" style={{ marginTop: "1rem" }}>
              <a
                href={initialData.scroll_link_target || "#carousel-section"}
                className="hero-scroll-cue-link"
              >
                <span>{initialData.scroll_link_label}</span>
                <span className="hero-scroll-arrow-down" aria-hidden="true">↓</span>
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
