import type { NextConfig } from "next";
import { CMS_CONFIG } from "./src/CMS_CONFIG";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: CMS_CONFIG.BASE_PATH,
  trailingSlash: true, // Ensures /culture becomes /culture/index.html
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
