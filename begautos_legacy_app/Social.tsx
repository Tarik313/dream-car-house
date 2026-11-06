import Image from "next/image";
import Link from "next/link";

type SocialItem = { image: string; title: string; url: string; is_featured: boolean };

export default function TestimonialGallerySection({ socialData }: { socialData: SocialItem[] }) {
  return (
    <section className="dream-social">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2>BEG across socials</h2>
        <Link href="/gallery" className="dream-view-car">View all ↗</Link>
      </div>
      {socialData.length ? (
        <div className="dream-social-grid">
          {socialData.map((item, index) => {
            const photo = <Image src={item.image || "/images/placeholder.png"} alt={item.title || "BEG AUTOS showroom"}
              fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="object-cover" />;
            return item.url ? (
              <a key={`${item.image}-${index}`} href={item.url} target="_blank" rel="noopener noreferrer"
                className="dream-social-item" aria-label={item.title || "View social post"}>{photo}</a>
            ) : <div key={`${item.image}-${index}`} className="dream-social-item">{photo}</div>;
          })}
        </div>
      ) : <p className="text-muted py-8">No social posts available yet.</p>}
    </section>
  );
}
