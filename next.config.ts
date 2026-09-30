import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return ["/books", "/papers"].map((source) => ({ source, destination: "/reading", permanent: true }));
  },
};

export default nextConfig;
