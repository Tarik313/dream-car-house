import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import {
  getPageSEO,
  buildMetadataFromSEO,
  getVisualChroniclesSection,
  getPublicInventory,
} from "@/lib/server/api";
import type { GalleryPhoto } from "@/lib/showroomData";

const fallbackMetadata: Metadata = {
  title: "Showroom Media Gallery & Atelier Chronicles | DREAM CAR HOUSE",
  description:
    "Explore high-definition photography and cinema spotlights of exotic, flagship, and rare luxury vehicles at DREAM CAR HOUSE Kakrail and Gulshan showrooms.",
  alternates: {
    canonical: "https://dreamcarhouse.com/gallery/",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSEO("gallery");
  return buildMetadataFromSEO(seo, fallbackMetadata);
}

function resolveVehicleCategory(
  carName: string,
  tag?: string
): { category: GalleryPhoto["category"]; label: string } {
  const lowerTag = (tag || "").toLowerCase();
  const lowerName = carName.toLowerCase();

  if (lowerTag.includes("cockpit") || lowerTag.includes("interior")) {
    return { category: "cockpit", label: "Artisan Cockpit" };
  }

  if (
    lowerName.includes("porsche") ||
    lowerName.includes("ferrari") ||
    lowerName.includes("gt") ||
    lowerName.includes("mclaren") ||
    lowerName.includes("audi r8") ||
    lowerName.includes("amg gt")
  ) {
    return { category: "supercars", label: "Supercar Track Pace" };
  }

  if (
    lowerName.includes("sedan") ||
    lowerName.includes("maybach") ||
    lowerName.includes("s-class") ||
    lowerName.includes("s 560") ||
    lowerName.includes("7 series") ||
    lowerName.includes("745le") ||
    lowerName.includes("rolls-royce") ||
    lowerName.includes("ghost")
  ) {
    return { category: "sedans", label: "Flagship Saloon" };
  }

  return { category: "suvs", label: "Luxury SUV / 4WD" };
}

export default async function GalleryPage() {
  const photos: GalleryPhoto[] = [];
  let photoIdCounter = 1;

  try {
    const [chronicles, inventory] = await Promise.all([
      getVisualChroniclesSection().catch(() => null),
      getPublicInventory().catch(() => ({ items: [] })),
    ]);

    // 1. Ingest Visual Chronicles items
    if (chronicles?.items && chronicles.items.length > 0) {
      for (const item of chronicles.items) {
        if (!item.image) continue;
        const cat: GalleryPhoto["category"] =
          item.card_type === "portrait"
            ? "sedans"
            : item.card_type === "hero"
            ? "supercars"
            : photoIdCounter % 2 === 0
            ? "suvs"
            : "cockpit";

        photos.push({
          id: item.id || photoIdCounter++,
          title: item.title,
          category: cat,
          categoryLabel: item.front_badge || "Showroom Spotlight",
          image: item.image,
          desc: item.description,
        });
      }
    }

    // 2. Ingest Published Vehicles images dynamically
    if (inventory?.items && inventory.items.length > 0) {
      for (const car of inventory.items) {
        // Feature Image
        if (car.image) {
          const { category, label } = resolveVehicleCategory(car.name);
          photos.push({
            id: photoIdCounter++,
            title: `${car.year ? `${car.year} ` : ""}${car.name}`,
            category,
            categoryLabel: label,
            image: car.image,
            desc: car.description || `${car.name} available at ${car.branch_name || "DREAM CAR HOUSE"}.`,
          });
        }

        // Additional Inventory Images (e.g. cockpit, exterior, wheels)
        if (Array.isArray(car.images)) {
          for (const img of car.images) {
            if (!img.url || img.url === car.image) continue;
            const { category, label } = resolveVehicleCategory(car.name, img.tag);
            photos.push({
              id: photoIdCounter++,
              title: img.caption || car.name,
              category,
              categoryLabel: img.tag ? `${car.brand} ${img.tag}` : label,
              image: img.url,
              desc: `${car.name} detailed perspective at our Dhaka showroom vault.`,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("[GalleryPage] Failed to fetch gallery photos:", err);
  }

  return <GalleryClient initialPhotos={photos} />;
}
