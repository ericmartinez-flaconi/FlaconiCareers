import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/FlaconiCareers',
  trailingSlash: true, // Ensures /culture becomes /culture/index.html
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
