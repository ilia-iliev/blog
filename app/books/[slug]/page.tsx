import Markdown from "@/components/Markdown";
import { getBookBySlug } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) notFound();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/books" className="text-sm text-gray-500 hover:underline mb-8 block">
        ← Back to Books
      </Link>
      <article>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{book.title}</h1>
          {book.author && <p className="text-lg text-gray-700 mb-1">{book.author}</p>}
          {book.date && <p className="text-sm text-gray-500 tabular-nums">{book.date}</p>}
        </header>
        <div className="text-base max-w-none">
          <Markdown content={book.content} />
        </div>
      </article>
    </main>
  );
}
