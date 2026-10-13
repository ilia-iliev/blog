import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/about", "/reading"].map((path) => ({ url: `${siteUrl}${path}` })),
    ...getAllArticles().map(({ path, published }) => ({ url: `${siteUrl}${path}`, lastModified: published })),
  ];
}
