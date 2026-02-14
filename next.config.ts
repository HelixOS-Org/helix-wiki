import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for Hostinger shared hosting (FTP deploy) */
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
