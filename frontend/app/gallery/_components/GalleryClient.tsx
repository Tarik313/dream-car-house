"use client";
import { useState } from "react";
import GalleryGrid, { GalleryGridSkeleton } from "./GalleryGrid";

interface GalleryItem {
  id?: number;
  image: string;
  title: string;
  url: string;
}

interface GalleryClientProps {
  initialResults: GalleryItem[];
  initialTotalPages: number;
}

export default function GalleryClient({
  initialResults,
  initialTotalPages,
}: GalleryClientProps) {
  const [batches, setBatches] = useState<GalleryItem[][]>([initialResults]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(currentPage < initialTotalPages);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const offset = currentPage * 14;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/home/people-talk/?limit=14&offset=${offset}`
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      const newResults: GalleryItem[] = result?.data?.results ?? [];

      setBatches((prev) => [...prev, newResults]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < (result?.data?.total_page ?? 0));
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="dream-gallery min-h-screen text-ink px-4 py-8 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto mt-15">
        <h1 className="text-4xl font-bold mb-3">DREAM CAR HOUSE Across Socials</h1>
        <p className="mb-10 text-muted max-w-3xl">Exclusive moments, showroom arrivals, and automotive excellence captured from our Dhaka headquarters.</p>

        {/* Render each batch with same GalleryGrid structure */}
        {batches.map((batch, index) => (
          <GalleryGrid key={index} images={batch} />
        ))}

        {/* Skeleton shown while loading more */}
        {isLoadingMore && <GalleryGridSkeleton />}

        {/* Load More Button */}
        {hasMore && !isLoadingMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="dream-primary px-6 py-3 rounded-lg font-medium hover:bg-soft transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
