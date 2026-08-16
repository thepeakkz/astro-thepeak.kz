import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  transpilePackages: ["lucide-react"],
  images: {
    minimumCacheTTL: 31_536_000,
    qualities: [75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.tildacdn.pro',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.thepeak.kz',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/service/web',
        destination: '/services/web',
        permanent: true,
      },
    ];
  },
  async headers() {
    const immutableHeroAssets = [
      '/hero-mobile-poster-v2.webp',
      '/hero-desktop-poster-v2.webp',
      '/hero-mobile-v2.mp4',
      '/hero-desktop-v2.webm',
      '/hero-desktop-v2.mp4',
    ];

    return immutableHeroAssets.map((source) => ({
      source,
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    }));
  },
};

export default nextConfig;
