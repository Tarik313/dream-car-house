"use client";
import Image from "next/image";

interface GalleryItem {
  id?: number;
  image: string;
  title: string;
  url: string;
}

interface GalleryGridProps {
  images: GalleryItem[];
}

function ImageCard({
  image,
  title,
  url,
  className,
}: {
  image: string;
  title: string;
  url: string;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative block overflow-hidden rounded-lg group ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
      <Image
        src={image || "/images/placeholder.png"}
        alt={title || "DREAM CAR HOUSE Exclusive Showcase"}
        width={400}
        height={300}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
      />
    </a>
  );
}

// Skeleton card - same size as ImageCard, no text, shimmer effect
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={`relative block overflow-hidden rounded-lg bg-panel animate-pulse ${className ?? ""}`}
    />
  );
}

export function GalleryGridSkeleton() {
  return (
    <div className="space-y-4 mt-4">
      {/* Row 1: 3 cols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard className="aspect-[4/3] min-h-[200px]" />
        <SkeletonCard className="aspect-[4/3] min-h-[200px]" />
        <SkeletonCard className="aspect-[4/3] min-h-[200px]" />
      </div>
      {/* Row 2: 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard className="aspect-[16/9] min-h-[200px]" />
        <SkeletonCard className="aspect-[16/9] min-h-[200px]" />
      </div>
      {/* Row 3: mixed */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonCard className="col-span-1 md:col-span-2 aspect-[32/15] min-h-[120px]" />
        <SkeletonCard className="col-span-1 aspect-[30/29] min-h-[180px]" />
        <SkeletonCard className="col-span-1 aspect-[30/29] min-h-[180px]" />
      </div>
      {/* Row 4: complex */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 grid grid-rows-2 gap-4">
          <SkeletonCard className="aspect-[16/9] min-h-[80px]" />
          <SkeletonCard className="aspect-[16/9] min-h-[80px]" />
        </div>
        <SkeletonCard className="col-span-1 aspect-[9/11] min-h-[140px]" />
        <div className="col-span-1 md:col-span-2 grid grid-rows-2 gap-4">
          <SkeletonCard className="aspect-[64/19] min-h-[100px]" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard className="aspect-[16/9] min-h-[80px]" />
            <SkeletonCard className="aspect-[16/9] min-h-[80px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const get = (i: number) =>
    images[i] ?? { image: "/images/placeholder.png", title: "", url: "#" };

  return (
    <div className="space-y-4 mt-4">
      {/* Row 1: 3 cols */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <ImageCard
          {...get(0)}
          className="aspect-[4/3] min-h-[200px] md:min-h-[100px]"
        />
        <ImageCard
          {...get(1)}
          className="aspect-[4/3] min-h-[200px] md:min-h-[100px]"
        />
        <ImageCard
          {...get(2)}
          className="aspect-[4/3] min-h-[200px] md:min-h-[100px]"
        />
      </div>

      {/* Row 2: 2 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <ImageCard
          {...get(3)}
          className="aspect-[16/9] min-h-[200px] md:min-h-[180px]"
        />
        <ImageCard
          {...get(4)}
          className="aspect-[16/9] min-h-[200px] md:min-h-[180px]"
        />
      </div>

      {/* Row 3: 2/3 + 1/3 + 1/3 */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <ImageCard
          {...get(5)}
          className="col-span-1 md:col-span-2 lg:col-span-2 aspect-[32/15] min-h-[120px] md:min-h-[100px]"
        />
        <ImageCard
          {...get(6)}
          className="col-span-1 aspect-[30/29] min-h-[180px] md:min-h-[100px]"
        />
        <ImageCard
          {...get(7)}
          className="col-span-1 aspect-[30/29] min-h-[180px] md:min-h-[100px]"
        />
      </div>

      {/* Row 4: complex layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Col 1: 2 stacked */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <div className="grid grid-rows-2 gap-4">
            <ImageCard
              {...get(8)}
              className="aspect-[16/9] min-h-[80px] md:min-h-[40px]"
            />
            <ImageCard
              {...get(9)}
              className="aspect-[16/9] min-h-[80px] md:min-h-[40px]"
            />
          </div>
        </div>
        {/* Col 2: tall portrait */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1">
          <ImageCard
            {...get(10)}
            className="aspect-[16/9] md:aspect-[9/11] lg:aspect-[9/11] min-h-[140px]"
          />
        </div>
        {/* Col 3-4: 2 rows */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="grid grid-rows-2 gap-4">
            <ImageCard
              {...get(11)}
              className="aspect-[64/19] md:aspect-[64/20] lg:aspect-[64/19] min-h-[100px] md:min-h-[100px]"
            />
            <div className="grid grid-cols-2 gap-4">
              <ImageCard
                {...get(12)}
                className="aspect-[16/9] md:aspect-[16/9] min-h-[80px] md:min-h-[10px]"
              />
              <ImageCard
                {...get(13)}
                className="aspect-[16/9] md:aspect-[16/9] min-h-[80px] md:min-h-[10px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
