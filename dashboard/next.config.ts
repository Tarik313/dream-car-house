import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: [
    "192.168.10.143",
    "192.168.10.225",
    "192.168.10.143:3000",
    "192.168.10.225:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "192.168.10.143:3000",
        "192.168.10.225:3000",
        "192.168.10.143",
        "192.168.10.225",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ] }];
  },
};
export default config;
