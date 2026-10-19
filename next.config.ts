import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // old bookmarked URL — dive sites moved up to /forecast (2026-07-14)
      { source: "/forecast/divesites", destination: "/forecast", permanent: true },
      // the store lives on its own site; nav, footer and /about still link /store
      { source: "/store", destination: "https://www.madart.shop", permanent: false },
    ];
  },
};

export default nextConfig;
