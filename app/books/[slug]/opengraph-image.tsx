import { getAllBooks, getBookBySlug } from "@/lib/data";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBooks().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBookBySlug(slug)!;
  return ogImage({ title: book.title, subtitle: book.author, label: "Book notes", date: book.date });
}
