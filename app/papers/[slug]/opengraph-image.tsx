import { getAllPapers, getPaperBySlug } from "@/lib/data";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPapers().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getPaperBySlug(slug)!;
  return ogImage({ title: paper.title, label: "Paper notes", date: paper.date });
}
