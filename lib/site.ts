import type { Metadata } from "next";

export const siteUrl = "https://ilia.foo";
export const siteName = "Ilia Iliev";
export const siteDescription = "Thoughts on technology, AI, and living a simple life.";

export function pageMetadata({
  path,
  title,
  description,
  published,
}: {
  path: string;
  title?: string;
  description?: string;
  published?: string;
}): Metadata {
  return {
    ...(title && { title }),
    description: description || siteDescription,
    alternates: { canonical: path },
    openGraph: {
      title: title ?? siteName,
      description: description || siteDescription,
      url: path,
      siteName,
      locale: "en_US",
      ...(published ? { type: "article", publishedTime: published } : { type: "website" }),
    },
  };
}
