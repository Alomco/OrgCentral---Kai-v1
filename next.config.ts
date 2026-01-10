import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  cacheComponents: true,
  serverExternalPackages: ['pino', 'thread-stream'],
  experimental: {
    turbopackFileSystemCacheForDev: true,
    ...(isDevelopment ? { serverComponentsHmrCache: false } : {}),
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
