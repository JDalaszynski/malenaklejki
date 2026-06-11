import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  allowedDevOrigins: ["192.168.1.96", "localhost:3000"],
};

export default nextConfig;
