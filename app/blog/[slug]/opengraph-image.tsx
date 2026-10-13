import { getAllPosts, getPostBySlug } from "@/lib/data";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug)!;
  return ogImage({ title: post.title, label: "Blog", date: post.date });
}
