import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Enable compression
  compress: true,

  // Performance optimization
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;

