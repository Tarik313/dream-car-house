"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VEHICLE_DATA, Vehicle } from "@/lib/showroomData";
import type { PublicVehicle } from "@/lib/types";
import { useUI } from "@/lib/UIContext";
import VehicleCard from "./VehicleCard";

export default function InventoryCarousel({ vehicles }: { vehicles?: PublicVehicle[] } = {}) {
  const { openCarModal } = useUI();
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Full inventory dataset (from dynamic API if available, fallback to showroomData)
  const allInventory = Array.isArray(vehicles) && vehicles.length > 0 ? vehicles : VEHICLE_DATA;

  // 3-tile duplicated dataset for mathematically seamless, infinite bidirectional wrapping
  const marqueeData = React.useMemo(() => [...allInventory, ...allInventory, ...allInventory], [allInventory]);

  // Animation & Physics Refs
  const posRef = useRef(0);
  const singleWidthRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const isHoveredRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const autoSpeedRef = useRef(-0.75); // Natural leftward slow-motion pace matching showroom style

  // Touch direction lock (distinguishes horizontal swipe vs vertical page scroll)
  const isTouchHorizontalRef = useRef<boolean | null>(null);
  const touchStartYRef = useRef(0);

  const [isGrabbing, setIsGrabbing] = useState(false);

  // Recalculate single set width on mount and resize
  const measureWidth = useCallback(() => {
    const track = trackRef.current;
    if (track) {
      // With 3 copies, one full set width is total scrollWidth divided by 3
      const totalWidth = track.scrollWidth;
      const singleWidth = totalWidth / 3;
      if (singleWidth > 0) {
        singleWidthRef.current = singleWidth;
        // Start in the middle copy so user can immediately swipe left or right
        if (posRef.current === 0) {
          posRef.current = -singleWidth;
          track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }
      }
    }
  }, []);

  useEffect(() => {
    measureWidth();
    // Re-measure after initial renders and image loads
    const t1 = setTimeout(measureWidth, 200);
    const t2 = setTimeout(measureWidth, 600);
    const t3 = setTimeout(measureWidth, 1200);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      ro = new ResizeObserver(() => {
        measureWidth();
      });
      ro.observe(trackRef.current);
    }

    window.addEventListener("resize", measureWidth);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measureWidth);
    };
  }, [measureWidth]);

  // Main 60fps Physics & Motion Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const track = trackRef.current;
      let singleWidth = singleWidthRef.current;

      // On-the-fly recovery if initial layout was delayed
      if (track && singleWidth <= 0 && track.scrollWidth > 0) {
        singleWidth = track.scrollWidth / 3;
        singleWidthRef.current = singleWidth;
        if (posRef.current === 0) {
          posRef.current = -singleWidth;
          track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }
      }

      if (track && singleWidth > 0) {
        if (!isDraggingRef.current) {
          // 1. Inertia Momentum Decay (if user swiped and released)
          if (Math.abs(velocityRef.current) > 0.08) {
            posRef.current += velocityRef.current;
            velocityRef.current *= 0.94; // Buttery friction
          } else {
            velocityRef.current = 0;
            // 2. Continuous Natural Auto-Motion (pauses on hover)
            if (!isHoveredRef.current) {
              posRef.current += autoSpeedRef.current;
            }
          }

          // 3. Seamless Infinite Modular Wrapping
          while (posRef.current < -2 * singleWidth) {
            posRef.current += singleWidth;
          }
          while (posRef.current > -singleWidth) {
            posRef.current -= singleWidth;
          }

          track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Hover Handlers
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };
  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary mouse button (left-click)
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsGrabbing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = moveEvent.clientX - dragStartXRef.current;
      if (Math.abs(deltaX) > 5) {
        hasDraggedRef.current = true;
      }

      posRef.current = dragStartPosRef.current + deltaX;

      // Handle wrapping while dragging
      const singleWidth = singleWidthRef.current;
      if (singleWidth > 0) {
        while (posRef.current < -2 * singleWidth) {
          posRef.current += singleWidth;
          dragStartPosRef.current += singleWidth;
        }
        while (posRef.current > -singleWidth) {
          posRef.current -= singleWidth;
          dragStartPosRef.current -= singleWidth;
        }
      }

      // Track instant velocity for release inertia
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 8) {
        const instantVel = ((moveEvent.clientX - lastPointerXRef.current) / dt) * 16.67;
        velocityRef.current = velocityRef.current * 0.35 + instantVel * 0.65;
        lastPointerXRef.current = moveEvent.clientX;
        lastTimeRef.current = now;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsGrabbing(false);

      // Clamp velocity for safe momentum
      velocityRef.current = Math.max(-28, Math.min(28, velocityRef.current));

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Reset drag flag after micro-delay so card onClick knows whether it was a drag or click
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 70);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Touch Swipe Handlers (Mobile with vertical scroll pass-through)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    isTouchHorizontalRef.current = null;
    dragStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    dragStartPosRef.current = posRef.current;
    lastPointerXRef.current = e.touches[0].clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - dragStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    // Detect gesture direction on first movement
    if (isTouchHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isTouchHorizontalRef.current = Math.abs(deltaX) >= Math.abs(deltaY);
      }
    }

    // If scrolling vertically, let the browser scroll down the page naturally
    if (isTouchHorizontalRef.current === false) {
      return;
    }

    // If swiping horizontally, control carousel
    if (isTouchHorizontalRef.current === true) {
      hasDraggedRef.current = true;
      posRef.current = dragStartPosRef.current + deltaX;

      const singleWidth = singleWidthRef.current;
      if (singleWidth > 0) {
        while (posRef.current < -2 * singleWidth) {
          posRef.current += singleWidth;
          dragStartPosRef.current += singleWidth;
        }
        while (posRef.current > -singleWidth) {
          posRef.current -= singleWidth;
          dragStartPosRef.current -= singleWidth;
        }
      }

      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 8) {
        const instantVel = ((currentX - lastPointerXRef.current) / dt) * 16.67;
        velocityRef.current = velocityRef.current * 0.35 + instantVel * 0.65;
        lastPointerXRef.current = currentX;
        lastTimeRef.current = now;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    isTouchHorizontalRef.current = null;

    // Clamp velocity for safe momentum
    velocityRef.current = Math.max(-28, Math.min(28, velocityRef.current));

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 70);
  };

  const router = useRouter();

  // Card Click: Navigate to full car detail page if not dragging/swiping
  const handleCardClick = (car: Vehicle | PublicVehicle) => {
    if (hasDraggedRef.current) return;
    router.push(`/cars/${car.slug || car.id}/`);
  };

  return (
    <section id="carousel-section" className="carousel-section w-full">
      <div className="luxury-container px-4 sm:px-6 lg:px-8">
        <div className="section-head">
          <h2 className="section-h2">Current Inventory</h2>
          <Link className="see-all-link" href="/inventory/" prefetch={true}>
            See All ({allInventory.length})
          </Link>
        </div>
      </div>

      <div
        ref={containerRef}
        className="inventory-slider-container w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          id="home-slider-track"
          className={`inventory-slider-track ${isGrabbing ? "is-grabbing" : ""}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClickCapture={(e) => {
            if (hasDraggedRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {marqueeData.map((car, index) => (
            <div
              key={`${car.id}-${index}`}
              className="card-item-slider"
              style={{ cursor: isGrabbing ? "grabbing" : "pointer" }}
            >
              <VehicleCard car={car} layout="carousel" showBranch={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
