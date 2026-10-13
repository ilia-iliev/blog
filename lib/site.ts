import type { Metadata } from "next";
import type { Article } from "./data";

export const siteUrl = "https://ilia.foo";
export const siteName = "Ilia Iliev";
export const siteDescription = "Thoughts on technology, AI, and living a simple life.";
export const feedPath = "/rss.xml";

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
    alternates: { canonical: path, types: { "application/rss+xml": feedPath } },
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

export const profiles = {
  github: "https://github.com/ilia-iliev",
  linkedin: "https://www.linkedin.com/in/ilia-iliev-7903a015a/",
  bluesky: "https://bsky.app/profile/ilia-i.bsky.social",
};

export const person = {
  "@type": "Person",
  name: siteName,
  url: siteUrl,
  jobTitle: "AI / Machine Learning Engineer",
  sameAs: Object.values(profiles),
};

export function articleJsonLd({ path, title, description, published }: Article) {
  return {
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: published,
    url: `${siteUrl}${path}`,
    author: person,
  };
}

export function toJsonLd(data: object) {
  return JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
}

const xmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => xmlEntities[char]);
}

function feedItem({ path, title, description, published }: Article) {
  return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${siteUrl}${path}</link>
      <guid>${siteUrl}${path}</guid>
      <pubDate>${new Date(published).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
}

export function rssFeed(articles: Article[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>en</language>
    <atom:link href="${siteUrl}${feedPath}" rel="self" type="application/rss+xml"/>
${articles.map(feedItem).join("\n")}
  </channel>
</rss>
`;
}
