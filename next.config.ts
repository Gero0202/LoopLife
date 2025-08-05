import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint:{
    ignoreDuringBuilds: true
  },
  /* config options here */
  devIndicators: false
};

export default nextConfig;
