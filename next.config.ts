import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.tildacdn.pro',
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
};

export default nextConfig;
