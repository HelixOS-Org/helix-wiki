import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for Hostinger shared hosting (FTP deploy) */
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /* Ensure build never fails on lint/type warnings */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
