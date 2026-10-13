import type { NextConfig } from "next";
import { siteUrl } from "./lib/site";

const aliasHosts = ["www.ilia.foo", "blog-chi-eight-77.vercel.app"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...aliasHosts.map((value) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value }],
        destination: `${siteUrl}/:path*`,
        permanent: true,
      })),
      ...["/books", "/papers"].map((source) => ({ source, destination: "/reading", permanent: true })),
    ];
  },
};

export default nextConfig;
