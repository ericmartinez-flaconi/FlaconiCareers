import type { NextConfig } from "next";
import { CMS_CONFIG } from "./src/CMS_CONFIG";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Only use export for production build, not local dev
  // This avoids the strictness of generateStaticParams on every single request
  output: isProd ? 'export' : undefined,
  basePath: CMS_CONFIG.BASE_PATH,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
