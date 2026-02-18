import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  cacheComponents: false,
  serverExternalPackages: ['pino', 'thread-stream'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    viewTransition: true,
    ...(isDevelopment ? { serverComponentsHmrCache: false } : {}),
    mcpServer: true,
  },
  reactCompiler: true,
  // Suppress verbose Turbopack output
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers for ISO 27001 compliance
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
