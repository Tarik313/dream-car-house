import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendOrigin =
      process.env.INTERNAL_BACKEND_URL ||
      process.env.BACKEND_API_ORIGIN ||
      "http://backend:8000";
    const origin = backendOrigin.replace(/\/$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${origin}/api/v1/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${origin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
