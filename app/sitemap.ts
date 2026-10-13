import type { MetadataRoute } from "next";
import { getAllBooks, getAllPapers, getAllPosts } from "@/lib/data";
import { siteUrl } from "@/lib/site";

function entries(basePath: string, items: { slug: string; date: string }[]): MetadataRoute.Sitemap {
  return items.map(({ slug, date }) => ({ url: `${siteUrl}/${basePath}/${slug}`, lastModified: date }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/about", "/reading"].map((path) => ({ url: `${siteUrl}${path}` })),
    ...entries("blog", getAllPosts()),
    ...entries("books", getAllBooks()),
    ...entries("papers", getAllPapers()),
  ];
}
