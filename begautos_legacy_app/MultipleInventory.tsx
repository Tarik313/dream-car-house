import Image from "next/image";
import Link from "next/link";

export default function MultipleInventory() {
  return (
    <div>
      <section className="dream-categories py-8 px-6">
        <div className="max-w-7xl mx-auto mb-5">
          {/* Title and See All link */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[32px] sm:text-2xl md:text-3xl font-medium text-ink">
              Choose per your preference
            </h2>
          </div>
          {/* <p className="text-[14px] max-w-5xl leading-relaxed text-justify text-ink">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using.
          </p> */}
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First Image */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden group">
              <Link href="/cars/brand-new" className="relative block h-full">
                <Image
                  src="/images/car-image-left.jpg"
                  alt="Reconditioned Unit"
                  fill
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover border-2 rounded-3xl"
                />

                {/* Overlay content */}
                <div className="dream-media absolute inset-0 bg-black/50 flex items-end p-6">
                  <div className="flex items-center justify-between w-full text-ink">
                    <div className="group">
                      <h2 className="text-xl md:text-3xl font-semibold mb-2 transition-all duration-300  group-hover:translate-x-1">
                        Reconditioned Unit
                      </h2>
                    </div>
                    <svg
                      className="w-8 h-8 text-gray-700 rounded-[4px] bg-white p-1 ml-4 group-hover:translate-x-1 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden group">
              <Link href="cars/pre-owned" className="relative block h-full">
                <Image
                  src="/images/car-image-right.jpg"
                  alt="Luxury Car"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover border-2 rounded-3xl"
                />

                {/* Overlay content */}
                <div className="dream-media absolute inset-0 bg-black/50 flex items-end p-6">
                  <div className="flex items-center justify-between w-full text-ink">
                    <div className="group">
                      <h2 className="text-xl md:text-3xl font-semibold mb-2 transition-all duration-300 group-hover:translate-x-1">
                        Pre-owned Unit
                      </h2>
                    </div>
                    <svg
                      className="w-8 h-8 text-gray-700 rounded-[4px] bg-white p-1 ml-4 group-hover:translate-x-1 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden group">
              <Link href="/byd-cars" className="relative block h-full">
                <Image
                  src="/images/byd_banner.jpeg"
                  alt="BYD"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover border-2 rounded-3xl"
                />

                {/* Overlay content */}
                <div className="dream-media absolute inset-0 bg-black/50 flex items-end p-6">
                  <div className="flex items-center justify-between w-full text-ink">
                    <div className="group">
                      <h2 className="text-xl md:text-3xl font-semibold mb-2 transition-all duration-300 group-hover:translate-x-1">
                        <Image
                          src="/images/byd_logo.png"
                          alt="BYD"
                          width={140}
                          height={40}
                          className="h-6 md:h-7 w-auto"
                        />
                      </h2>
                    </div>
                    <svg
                      className="w-8 h-8 text-gray-700 rounded-[4px] bg-white p-1 ml-4 group-hover:translate-x-1 transition-transform duration-200"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
