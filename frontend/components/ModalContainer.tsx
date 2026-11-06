"use client";

import React from "react";
import NavDrawer from "./NavDrawer";
import CarModal from "./CarModal";
import AppointmentModal from "./AppointmentModal";
import VideoModal from "./VideoModal";
import GalleryLightbox from "./GalleryLightbox";
import CompareModal from "./CompareModal";
import ShowroomStories from "./ShowroomStories";
import type {
  PublicSiteSettings,
  PublicShowroomBranch,
  PublicVehicle,
  PublicShowroomStory,
} from "@/lib/types";

export default function ModalContainer({
  settings,
  branches,
  featuredVehicles,
  stories,
}: {
  settings?: PublicSiteSettings;
  branches?: PublicShowroomBranch[];
  featuredVehicles?: PublicVehicle[];
  stories?: PublicShowroomStory[];
}) {
  return (
    <>
      <NavDrawer settings={settings} branches={branches} />
      <CarModal settings={settings} branches={branches} />
      <AppointmentModal settings={settings} branches={branches} />
      <VideoModal settings={settings} branches={branches} />
      <GalleryLightbox />
      <CompareModal initialVehicles={featuredVehicles} />
      <ShowroomStories settings={settings} vehicles={featuredVehicles} stories={stories} />
    </>
  );
}
