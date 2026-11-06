"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUI } from "@/lib/UIContext";
import type { PublicShowroomStory, PublicSiteSettings } from "@/lib/types";

const DEFAULT_STORY_DURATION_MS = 6000; // 6 seconds for image slides

export default function ShowroomStories({
  settings,
  stories = [],
}: {
  settings?: PublicSiteSettings;
  vehicles?: unknown;
  stories?: PublicShowroomStory[];
} = {}) {
  const { isStoriesOpen, closeStories } = useUI();
  const router = useRouter();

  // Active list of stories from SSR backend
  const activeStories = stories && stories.length > 0 ? stories : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Muted by default for executive discretion

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Advance to next story
  const nextStory = useCallback(() => {
    if (currentIndex < activeStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      // Finished all stories
      closeStories();
    }
  }, [currentIndex, activeStories.length, closeStories]);

  // Go to previous story
  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
    } else {
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      startTimeRef.current = Date.now();
    }
  }, [currentIndex]);

  const current = activeStories[currentIndex];
  const isVideo = current?.media_type === "video";

  // Sync video audio element whenever isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle active progress bar timing for image slides (or fallback if video duration not ready)
  useEffect(() => {
    if (!isStoriesOpen || activeStories.length === 0) {
      setCurrentIndex(0);
      setProgress(0);
      setIsPaused(false);
      elapsedBeforePauseRef.current = 0;
      return;
    }

    if (isPaused) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      return;
    }

    // If it's a video, the video element's own timeupdate event will sync progress
    if (isVideo) {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          // Browser autoplay restriction fallback
        });
      }
      return;
    }

    // For images, use timer
    const interval = 40; // 40ms tick for 60fps smoothness
    const timer = setInterval(() => {
      const now = Date.now();
      const totalElapsed = elapsedBeforePauseRef.current + (now - startTimeRef.current);
      const newProgress = Math.min(100, (totalElapsed / DEFAULT_STORY_DURATION_MS) * 100);

      setProgress(newProgress);

      if (totalElapsed >= DEFAULT_STORY_DURATION_MS) {
        clearInterval(timer);
        nextStory();
      }
    }, interval);

    timerRef.current = timer;

    return () => clearInterval(timer);
  }, [isStoriesOpen, isPaused, currentIndex, nextStory, isVideo, activeStories.length]);

  // Handle video progress updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isPaused) {
      const dur = videoRef.current.duration;
      const cur = videoRef.current.currentTime;
      if (dur > 0) {
        setProgress(Math.min(100, (cur / dur) * 100));
      }
    }
  };

  // Hold to pause handlers
  const handleHoldStart = () => {
    if (!isPaused) {
      elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
      setIsPaused(true);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  const handleHoldEnd = () => {
    if (isPaused) {
      startTimeRef.current = Date.now();
      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Click on screen: left 35% = prev, right 65% = next
  const handleStoryTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;

    if (ratio < 0.35) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const handleCtaClick = (link: string) => {
    closeStories();
    router.push(link);
  };

  if (!isStoriesOpen || activeStories.length === 0 || !current) return null;

  const rawWhatsapp = settings?.whatsapp || settings?.hotline || "8801615121312";
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="stories-modal-backdrop" id="stories-modal-backdrop" onClick={closeStories}>
      <div
        className="stories-viewer-container"
        id="stories-viewer-container"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {/* Story Progress Bars */}
        <div className="story-progress-strip">
          {activeStories.map((item, idx) => {
            let fillPct = 0;
            if (idx < currentIndex) fillPct = 100;
            else if (idx === currentIndex) fillPct = progress;

            return (
              <div key={item.id} className="story-progress-track">
                <div
                  className="story-progress-fill"
                  style={{
                    width: `${fillPct}%`,
                    backgroundColor: idx === currentIndex ? item.accent_color || "#38bdf8" : "#ffffff",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Top Header Bar */}
        <div className="story-top-header">
          <div className="story-account-info">
            <div className="story-avatar-gold-ring">
              <span className="story-avatar-star">✦</span>
            </div>
            <div>
              <div className="story-account-name-row">
                <span className="story-account-title">{settings?.name || "DREAM CAR HOUSE"}</span>
                <span className="story-verified-check">✓</span>
              </div>
              <span className="story-timestamp">
                {isVideo ? "Cinematic Video Reel" : "VIP Showroom Spotlight"}
              </span>
            </div>
          </div>

          <div className="story-header-actions">
            {/* Pause Indicator */}
            {isPaused && <span className="story-pause-badge">PAUSED</span>}

            {/* Sound Toggle Button (Available for Video Reels) */}
            {isVideo && (
              <button
                type="button"
                className="story-icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (videoRef.current) {
                    videoRef.current.muted = nextMuted;
                  }
                }}
                title={isMuted ? "Unmute Engine Audio" : "Mute Engine Audio"}
                aria-label="Toggle Story Audio"
                style={{
                  background: isMuted ? "rgba(0,0,0,0.6)" : "rgba(56, 189, 248, 0.3)",
                  border: isMuted ? "1px solid rgba(255,255,255,0.2)" : "1px solid #38bdf8",
                }}
              >
                {isMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              className="story-icon-btn story-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeStories();
              }}
              title="Close Stories (ESC)"
              aria-label="Close Stories"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Story Media Area (Hybrid: Video or Image) */}
        <div className="story-media-area" onClick={handleStoryTap}>
          {isVideo ? (
            <video
              ref={videoRef}
              key={current.id}
              src={current.media_url}
              autoPlay
              playsInline
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={nextStory}
              className="story-bg-video"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          ) : (
            <Image
              key={current.id}
              src={current.media_url}
              alt={current.title}
              fill
              className="story-bg-image"
              priority
              sizes="(max-width: 768px) 100vw, 450px"
            />
          )}

          {/* Vignette Gradients */}
          <div className="story-vignette-top"></div>
          <div className="story-vignette-bottom"></div>

          {/* Tap Navigation Hints (Invisible touch targets) */}
          <div className="story-tap-left" title="Tap for Previous Story"></div>
          <div className="story-tap-right" title="Tap for Next Story"></div>
        </div>

        {/* Story Bottom Content & Actions */}
        <div className="story-bottom-content">
          <div
            className="story-tag-pill"
            style={{
              backgroundColor: `${current.accent_color || "#38bdf8"}22`,
              borderColor: `${current.accent_color || "#38bdf8"}66`,
              color: current.accent_color || "#38bdf8",
            }}
          >
            <span className="story-tag-pulse" style={{ backgroundColor: current.accent_color || "#38bdf8" }}></span>
            <span>{current.tag || "SHOWROOM SPOTLIGHT"}</span>
          </div>

          <h3 className="story-headline">{current.title}</h3>
          {current.subtitle && <p className="story-subheadline">{current.subtitle}</p>}

          <div className="story-meta-row">
            <span className="story-price-pill">{current.price_note || current.brand || "Available"}</span>
            <span className="story-slide-counter">
              Story {currentIndex + 1} of {activeStories.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="story-action-buttons">
            <button
              type="button"
              className="story-primary-cta"
              onClick={(e) => {
                e.stopPropagation();
                handleCtaClick(current.cta_link || "/inventory");
              }}
            >
              <span>{current.cta_text || "Inspect Vehicle"}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(current.whatsapp_message || "Hello Dream Car House, I want to inquire about this vehicle.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="story-whatsapp-cta"
              onClick={(e) => e.stopPropagation()}
              title="Chat with VIP Concierge on WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
