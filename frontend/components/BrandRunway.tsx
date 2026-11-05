"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_RUNWAY_BRANDS } from "@/lib/showroomData";

// Sleek Stealth GT Sweeper - Dark carbon silhouette, dual glowing exhaust flames, red LED taillight
const CAR_SVG_SWEEPER = `
<svg class="runway-car-svg" viewBox="0 0 190 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="exhaustFlame" x1="0" y1="37" x2="24" y2="37" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ff0044" stop-opacity="0"/>
      <stop offset="35%" stop-color="#ff3300" stop-opacity="0.95"/>
      <stop offset="75%" stop-color="#ffbb00" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
    </linearGradient>
    <filter id="neonRedGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Ground Underglow Neon Red Strip -->
  <line x1="26" y1="47" x2="155" y2="47" stroke="#ef4444" stroke-width="3" stroke-linecap="round" opacity="0.85" filter="url(#neonRedGlow)"/>

  <!-- Exhaust Jet Flames at Rear -->
  <polygon points="2,37 20,33 20,41" fill="url(#exhaustFlame)"/>
  <ellipse cx="6" cy="37" rx="6" ry="2.5" fill="#ff4400" filter="drop-shadow(-4px 0 6px #ff0044)"/>

  <!-- Rear Wing / Aerodynamic Spoiler -->
  <path d="M4 27 L18 27 L16 31 L6 31 Z" fill="#1e293b" stroke="#dc2626" stroke-width="0.8"/>
  <line x1="10" y1="31" x2="10" y2="38" stroke="#dc2626" stroke-width="1.8"/>

  <!-- Main Body Shell - Carbon fiber low silhouette -->
  <path d="M14 36 C18 31 30 29 42 29 C52 29 60 19 82 15 C104 12 136 14 152 23 C164 25 174 29 180 34 C183 37 181 40 176 42 C168 44 154 44 144 44 C141 38 134 33 125 33 C116 33 109 38 107 44 L60 44 C58 38 51 33 42 33 C33 33 26 38 24 44 L12 44 C8 44 6 40 14 36 Z" 
        fill="#0a0d14" stroke="#dc2626" stroke-width="1.4"/>

  <!-- Tinted Cockpit Glass / Canopy -->
  <path d="M72 18 C88 15 124 15 140 23 L130 25 C114 19 90 19 76 22 Z" fill="#ef4444" opacity="0.35"/>
  <path d="M84 17 L120 17 L115 24 L78 24 Z" fill="#030508" opacity="0.95"/>

  <!-- Red LED Tail Light Bar -->
  <path d="M8 34 L22 34" stroke="#ff0033" stroke-width="3" stroke-linecap="round" filter="drop-shadow(-3px 0 5px #ff0000)"/>

  <!-- Rear Wheel with Red Brembo Caliper -->
  <circle cx="42" cy="42" r="10.5" fill="#040609" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="42" cy="42" r="6" fill="#1e293b"/>
  <circle cx="42" cy="42" r="3" fill="#dc2626"/>
  <path d="M38 37 A 7 7 0 0 1 44 35" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Front Wheel with Red Brembo Caliper -->
  <circle cx="125" cy="42" r="10.5" fill="#040609" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="125" cy="42" r="6" fill="#1e293b"/>
  <circle cx="125" cy="42" r="3" fill="#dc2626"/>
  <path d="M121 37 A 7 7 0 0 1 127 35" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// Luminous Hypercar Deployer - Liquid platinum, forward projector high-beam, cyan LED underglow
const CAR_SVG_DEPLOYER = `
<svg class="runway-car-svg" viewBox="0 0 190 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="deployHeadlightGrad" x1="178" y1="34" x2="255" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="25%" stop-color="#67e8f9" stop-opacity="0.7"/>
      <stop offset="65%" stop-color="#38bdf8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </linearGradient>
    <filter id="neonCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Forward Projected Headlight Beam Cone onto Road Surface -->
  <polygon points="178,34 260,8 260,56" fill="url(#deployHeadlightGrad)" opacity="0.88"/>

  <!-- Ground Underglow Neon Cyan Strip -->
  <line x1="26" y1="47" x2="155" y2="47" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" opacity="0.9" filter="url(#neonCyanGlow)"/>

  <!-- Main Body Shell - Liquid platinum & titanium alloy -->
  <path d="M14 36 C18 31 30 29 42 29 C52 29 60 19 82 15 C104 12 136 14 152 23 C164 25 174 29 180 34 C183 37 181 40 176 42 C168 44 154 44 144 44 C141 38 134 33 125 33 C116 33 109 38 107 44 L60 44 C58 38 51 33 42 33 C33 33 26 38 24 44 L12 44 C8 44 6 40 14 36 Z" 
        fill="#0f172a" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1.4"/>

  <!-- Tinted Panoramic Canopy Glass -->
  <path d="M72 18 C88 15 124 15 140 23 L130 25 C114 19 90 19 76 22 Z" fill="#ffffff" opacity="0.45"/>
  <path d="M84 17 L120 17 L115 24 L78 24 Z" fill="#020617" opacity="0.92"/>

  <!-- Headlight Cluster (Glowing Projector Lens) -->
  <circle cx="178" cy="33" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 8px #38bdf8)"/>
  <path d="M172 32 L178 34" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>

  <!-- Rear Wheel with Silver Monoblock -->
  <circle cx="42" cy="42" r="10.5" fill="#020617" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2"/>
  <circle cx="42" cy="42" r="6" fill="#334155"/>
  <circle cx="42" cy="42" r="3" fill="#ffffff"/>

  <!-- Front Wheel with Silver Monoblock -->
  <circle cx="125" cy="42" r="10.5" fill="#020617" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2"/>
  <circle cx="125" cy="42" r="6" fill="#334155"/>
  <circle cx="125" cy="42" r="3" fill="#ffffff"/>
</svg>`;

export default function BrandRunway({ brands }: { brands?: unknown } = {}) {
  const router = useRouter();

  // Responsive page size: Mobile = 3, Tablet = 6, Desktop = 8
  const [pageSize, setPageSize] = useState<number>(8);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [dissolvedIndexes, setDissolvedIndexes] = useState<number[]>([]);
  const [deployingIndexes, setDeployingIndexes] = useState<number[]>([]);

  const trackRef = useRef<HTMLDivElement>(null);
  const carActorRef = useRef<HTMLDivElement>(null);
  const fxLayerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Determine page size based on window width
  const calculatePageSize = useCallback(() => {
    if (typeof window === "undefined") return 8;
    const width = window.innerWidth;
    if (width < 640) return 3; // Mobile: 3 brands at a time
    if (width < 1024) return 6; // Tablet: 6 brands at a time
    return 8; // Desktop: 8 brands at a time
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newSize = calculatePageSize();
      setPageSize((prevSize) => {
        if (prevSize !== newSize) {
          // Snap startIndex to new chunk boundary
          setStartIndex((prevIndex) => Math.floor(prevIndex / newSize) * newSize);
          return newSize;
        }
        return prevSize;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePageSize]);

  const filterByBrand = (brandName: string) => {
    router.push(`/inventory?brand=${encodeURIComponent(brandName)}`);
  };

  // Run the majestic luxury car cruise with real-time wake synchronization
  const runRunwayCycle = useCallback(() => {
    if (isAnimatingRef.current) return;
    if (isHoveredRef.current) return;

    const track = trackRef.current;
    const carActor = carActorRef.current;
    const fxLayer = fxLayerRef.current;
    if (!track || !carActor) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>(".runway-brand-card"));
    if (!cards.length) return;

    isAnimatingRef.current = true;

    // Majestic cruise duration: 5.6 seconds (stately, luxurious, clearly visible)
    const cruiseDuration = 5600;

    // ==========================================
    // PHASE 1: SWEEPER CAR (Dissolves in wake)
    // ==========================================
    carActor.innerHTML = CAR_SVG_SWEEPER;
    carActor.style.transition = "none";
    carActor.style.left = "-240px";
    void carActor.offsetWidth; // Force reflow

    // Smooth luxury cruise transition
    carActor.style.transition = `left ${cruiseDuration}ms cubic-bezier(0.35, 0.05, 0.25, 0.98)`;
    carActor.style.left = "calc(100% + 90px)";

    const processedDissolve = new Set<number>();

    // Real-time animation frame loop to synchronize card dissolve right behind the car's tail
    const checkSweepWake = () => {
      if (!carActor || !track) return;
      const trackRect = track.getBoundingClientRect();
      const carRect = carActor.getBoundingClientRect();
      const currentCards = Array.from(track.querySelectorAll<HTMLElement>(".runway-brand-card"));

      // The exhaust / wake is at the rear bumper of the car (carRect.left + 15px)
      const carExhaustX = carRect.left + 15;

      currentCards.forEach((card, idx) => {
        if (processedDissolve.has(idx)) return;
        const cardRect = card.getBoundingClientRect();
        // Dissolve the instant the car's tail/exhaust has covered the card's center
        const cardTriggerX = cardRect.left + cardRect.width * 0.42;

        if (carExhaustX >= cardTriggerX) {
          processedDissolve.add(idx);
          setDissolvedIndexes((prev) => [...prev, idx]);

          // Spawn tire smoke & dust puffs right in the wake behind the exhaust
          if (fxLayer) {
            const cardCenterX = cardRect.left - trackRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top - trackRect.top + cardRect.height / 2;
            for (let p = 0; p < 4; p++) {
              const puff = document.createElement("div");
              puff.className = "fx-dust-puff";
              const size = 32 + Math.random() * 32;
              puff.style.width = `${size}px`;
              puff.style.height = `${size}px`;
              puff.style.left = `${cardCenterX + (Math.random() * 26 - 13)}px`;
              puff.style.top = `${cardCenterY + (Math.random() * 18 - 9)}px`;
              fxLayer.appendChild(puff);
              setTimeout(() => puff.remove(), 850);
            }
          }
        }
      });

      if (processedDissolve.size < currentCards.length && carRect.left < trackRect.right + 50) {
        animFrameIdRef.current = requestAnimationFrame(checkSweepWake);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(checkSweepWake);

    // When Sweeper Car finishes its cruise across the track
    setTimeout(() => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

      carActor.style.transition = "none";
      carActor.style.left = "-240px";

      // Calculate next sequential batch without skipping ANY brand!
      setStartIndex((prev) => (prev + pageSize) % ALL_RUNWAY_BRANDS.length);

      // Initialize all incoming cards in dissolved state so they materialize cleanly
      setDissolvedIndexes(Array.from({ length: pageSize }, (_, i) => i));
      setDeployingIndexes([]);

      // ==========================================
      // PHASE 2: DEPLOYER CAR (Deploys in wake)
      // ==========================================
      setTimeout(() => {
        carActor.innerHTML = CAR_SVG_DEPLOYER;
        carActor.style.transition = "none";
        carActor.style.left = "-240px";
        void carActor.offsetWidth; // Force reflow

        carActor.style.transition = `left ${cruiseDuration}ms cubic-bezier(0.35, 0.05, 0.25, 0.98)`;
        carActor.style.left = "calc(100% + 90px)";

        const processedDeploy = new Set<number>();

        // Real-time animation frame loop to deploy cards right behind the car's rear wheels
        const checkDeployWake = () => {
          if (!carActor || !track) return;
          const trackRect = track.getBoundingClientRect();
          const carRect = carActor.getBoundingClientRect();
          const currentCards = Array.from(track.querySelectorAll<HTMLElement>(".runway-brand-card"));

          // Deployer reveals logos right behind its rear wheels
          const carRearWheelX = carRect.left + 35;

          currentCards.forEach((card, idx) => {
            if (processedDeploy.has(idx)) return;
            const cardRect = card.getBoundingClientRect();
            const cardTriggerX = cardRect.left + cardRect.width * 0.42;

            if (carRearWheelX >= cardTriggerX) {
              processedDeploy.add(idx);
              // Un-dissolve and trigger stamp down deployment
              setDissolvedIndexes((prev) => prev.filter((id) => id !== idx));
              setDeployingIndexes((prev) => [...prev, idx]);

              // Spawn luxury friction flare / cyan spark burst right behind the wheels
              if (fxLayer) {
                const cardCenterX = cardRect.left - trackRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top - trackRect.top + cardRect.height / 2;
                const flare = document.createElement("div");
                flare.className = "fx-stamp-flare";
                flare.style.left = `${cardCenterX}px`;
                flare.style.top = `${cardCenterY}px`;
                fxLayer.appendChild(flare);
                setTimeout(() => flare.remove(), 600);
              }
            }
          });

          if (processedDeploy.size < currentCards.length && carRect.left < trackRect.right + 50) {
            animFrameIdRef.current = requestAnimationFrame(checkDeployWake);
          }
        };

        animFrameIdRef.current = requestAnimationFrame(checkDeployWake);

        // When Deployer Car exits to the right
        setTimeout(() => {
          if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

          carActor.style.transition = "none";
          carActor.style.left = "-240px";
          setDeployingIndexes([]);
          isAnimatingRef.current = false;
        }, cruiseDuration + 300);
      }, 450);
    }, cruiseDuration + 150);
  }, [pageSize]);

  // Recurring interval: Cruise runs every 19 seconds (allowing ~8 seconds of resting interaction)
  useEffect(() => {
    const handleTrigger = () => runRunwayCycle();
    window.addEventListener("trigger-runway-cycle", handleTrigger);

    const timer = setInterval(() => {
      runRunwayCycle();
    }, 19500);

    return () => {
      clearInterval(timer);
      window.removeEventListener("trigger-runway-cycle", handleTrigger);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [runRunwayCycle]);

  // Sliced brands for current active view
  const visibleBrands = Array.from({ length: pageSize }, (_, i) => {
    const idx = (startIndex + i) % ALL_RUNWAY_BRANDS.length;
    return { ...ALL_RUNWAY_BRANDS[idx], originalIndex: idx };
  });

  return (
    <section className="brand-strip-section" id="brand-runway-section">
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="runway-header">
          <h2 className="section-h2" style={{ marginBottom: "0.35rem" }}>
            Prestigious Automotive Marques
          </h2>
          <p className="runway-subtext">
            Official luxury dealerships & certified engineering partners at DREAM CAR HOUSE.
          </p>
        </div>

        {/* Asphalt Runway Track */}
        <div
          ref={trackRef}
          className="runway-track-wrapper"
          id="runway-track-wrapper"
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
          style={{ "--runway-cols": pageSize } as React.CSSProperties}
        >
          {/* Road Surface */}
          <div className="runway-road-surface">
            <div className="runway-speed-lines"></div>
            <div className="runway-center-dashes"></div>
          </div>

          {/* Dynamic Particle FX Layer */}
          <div ref={fxLayerRef} className="runway-fx-layer" id="runway-fx-layer"></div>

          {/* The Moving Car Actor */}
          <div ref={carActorRef} className="runway-car-actor" id="runway-car-actor"></div>

          {/* The Dynamically Sized Brand Logos Grid */}
          <div className="brand-runway-row" id="brand-runway-row">
            {visibleBrands.map((brand, i) => {
              const isDissolved = dissolvedIndexes.includes(i);
              const isDeploying = deployingIndexes.includes(i);

              return (
                <div
                  key={`${brand.name}-${brand.originalIndex}`}
                  className={`runway-brand-card ${isDissolved ? "is-dissolved" : ""} ${
                    isDeploying ? "is-deploying" : ""
                  }`}
                  data-index={i}
                  onClick={() => filterByBrand(brand.filterBrand)}
                  title={`View ${brand.name} Collection`}
                >
                  <div className="brand-badge-inner">
                    <div
                      style={{ display: "contents" }}
                      dangerouslySetInnerHTML={{ __html: brand.svg }}
                    />
                    <span className="runway-brand-name">{brand.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
