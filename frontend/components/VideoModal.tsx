"use client";

import React from "react";
import { useUI } from "@/lib/UIContext";
import { VIDEO_CONFIGS } from "@/lib/showroomData";

import type { PublicSiteSettings, PublicShowroomBranch } from "@/lib/types";

export default function VideoModal({
  settings,
  branches = [],
}: {
  settings?: PublicSiteSettings;
  branches?: PublicShowroomBranch[];
} = {}) {
  const { activeVideo, closeVideoModal, openAppointmentModal } = useUI();

  if (!activeVideo) return null;

  const isDirectUrl = activeVideo.startsWith("http://") || activeVideo.startsWith("https://") || activeVideo.startsWith("//");
  const config = isDirectUrl
    ? {
        pill: "CINEMATIC SHOWCASE",
        title: `${settings?.name || "DREAM CAR HOUSE"} Cinema Showcase`,
        sub: `${settings?.tagline || "Where Extraordinary Dreams Meet The Road"} • Dhaka`,
        embed: activeVideo,
      }
    : VIDEO_CONFIGS[activeVideo] || VIDEO_CONFIGS.reel;

  const addressText = branches.length > 0
    ? branches.map((b) => `${b.short_name || b.name}: ${b.address}`).join(" • ")
    : settings?.primary_address
    ? `${settings.primary_address} • Private viewings by reservation`
    : "18, Shaheed Captain Monsur Ali Soroni, Kakrail, Dhaka • Private viewings by reservation";

  return (
    <div className="car-modal-backdrop active" onClick={closeVideoModal}>
      <div className="car-modal-box experience-video-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-x video-close-btn"
          onClick={closeVideoModal}
          aria-label="Close Cinema Video"
          title="Close (ESC)"
        >
          &times;
        </button>

        <div className="video-modal-head">
          <div className="video-modal-pill">{config.pill}</div>
          <h3 className="video-modal-title">{config.title}</h3>
          <p className="video-modal-sub">{config.sub}</p>
        </div>

        <div className="video-modal-frame-wrap">
          <iframe
            id="experience-video-iframe"
            src={config.embed}
            title={config.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="video-modal-footer">
          <div className="video-foot-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{addressText}</span>
          </div>

          <button
            type="button"
            className="consult-primary-btn"
            onClick={() => {
              closeVideoModal();
              openAppointmentModal();
            }}
            style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
          >
            <span>Schedule Private Tour</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
