import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // old bookmarked URL — dive sites moved up to /forecast (2026-07-14)
    return [{ source: "/forecast/divesites", destination: "/forecast", permanent: true }];
  },
};

export default nextConfig;
