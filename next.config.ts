import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,
  // Suppress verbose Turbopack output
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
