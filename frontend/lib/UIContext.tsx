"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Vehicle, GalleryPhoto } from "./showroomData";

export type ThemeMode = "dark" | "light";
export type HeroCarFilter = "ALL" | "BRAND_NEW" | "RECONDITIONED";

interface UIContextType {
  // Global Day / Night Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Hero Car Filter (Brand New vs Reconditioned)
  heroCarFilter: HeroCarFilter;
  setHeroCarFilter: (filter: HeroCarFilter) => void;

  // Navigation Drawer
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Car Detail Modal
  selectedCar: Vehicle | null;
  openCarModal: (car: Vehicle) => void;
  closeCarModal: () => void;

  // Appointment Modal
  isAppointmentOpen: boolean;
  appointmentPrefill: { carName?: string; carYear?: number; branchId?: string };
  openAppointmentModal: (prefill?: { carName?: string; carYear?: number; branchId?: string }) => void;
  closeAppointmentModal: () => void;

  // Video Lightbox Modal
  activeVideo: "reel" | "tour" | null;
  openVideoModal: (type: "reel" | "tour") => void;
  closeVideoModal: () => void;

  // Gallery Lightbox Modal
  galleryLightboxIndex: number | null;
  galleryPhotos: GalleryPhoto[];
  openGalleryLightbox: (index: number, photos?: GalleryPhoto[]) => void;
  closeGalleryLightbox: () => void;

  // Compare Modal
  isCompareOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;

  // Showroom Stories Modal
  isStoriesOpen: boolean;
  openStories: () => void;
  closeStories: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  // Global Theme State
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  // Hero Inventory Filter
  const [heroCarFilter, setHeroCarFilter] = useState<HeroCarFilter>("ALL");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentPrefill, setAppointmentPrefill] = useState<{
    carName?: string;
    carYear?: number;
    branchId?: string;
  }>({});
  const [activeVideo, setActiveVideo] = useState<"reel" | "tour" | null>(null);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);

  // Initialize theme from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dch-theme") as ThemeMode | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (_) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("dch-theme", newTheme);
    } catch (_) {}
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const openStories = () => setIsStoriesOpen(true);
  const closeStories = () => setIsStoriesOpen(false);

  const openCarModal = (car: Vehicle) => setSelectedCar(car);
  const closeCarModal = () => setSelectedCar(null);

  const openAppointmentModal = (prefill?: { carName?: string; carYear?: number; branchId?: string }) => {
    setAppointmentPrefill(prefill || {});
    setIsAppointmentOpen(true);
  };
  const closeAppointmentModal = () => {
    setIsAppointmentOpen(false);
    setAppointmentPrefill({});
  };

  const openVideoModal = (type: "reel" | "tour") => setActiveVideo(type);
  const closeVideoModal = () => setActiveVideo(null);

  const openGalleryLightbox = (index: number, photos?: GalleryPhoto[]) => {
    if (photos) setGalleryPhotos(photos);
    setGalleryLightboxIndex(index);
  };
  const closeGalleryLightbox = () => setGalleryLightboxIndex(null);

  const openCompareModal = () => setIsCompareOpen(true);
  const closeCompareModal = () => setIsCompareOpen(false);

  // Lock body scroll when any modal or drawer is open
  useEffect(() => {
    const isAnyOpen =
      isDrawerOpen ||
      selectedCar !== null ||
      isAppointmentOpen ||
      activeVideo !== null ||
      galleryLightboxIndex !== null ||
      isCompareOpen ||
      isStoriesOpen;

    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, selectedCar, isAppointmentOpen, activeVideo, galleryLightboxIndex, isCompareOpen, isStoriesOpen]);

  // Handle ESC key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isStoriesOpen) closeStories();
        else if (galleryLightboxIndex !== null) closeGalleryLightbox();
        else if (selectedCar !== null) closeCarModal();
        else if (isAppointmentOpen) closeAppointmentModal();
        else if (activeVideo !== null) closeVideoModal();
        else if (isCompareOpen) closeCompareModal();
        else if (isDrawerOpen) closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryLightboxIndex, selectedCar, isAppointmentOpen, activeVideo, isCompareOpen, isDrawerOpen, isStoriesOpen]);

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        heroCarFilter,
        setHeroCarFilter,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        selectedCar,
        openCarModal,
        closeCarModal,
        isAppointmentOpen,
        appointmentPrefill,
        openAppointmentModal,
        closeAppointmentModal,
        activeVideo,
        openVideoModal,
        closeVideoModal,
        galleryLightboxIndex,
        galleryPhotos,
        openGalleryLightbox,
        closeGalleryLightbox,
        isCompareOpen,
        openCompareModal,
        closeCompareModal,
        isStoriesOpen,
        openStories,
        closeStories,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
