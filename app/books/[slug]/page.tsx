import { getBookBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/books" className="text-sm text-gray-500 hover:underline mb-8 block">
        ← Back to Books
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{book.title}</h1>
          {book.date && (
            <p className="text-sm text-gray-500 tabular-nums">{book.date}</p>
          )}
        </header>

        <div className="prose prose-base max-w-none">
          {book.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="text-xl font-bold mt-8 mb-3">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={i} className="list-disc pl-6 mb-6 space-y-2 leading-relaxed">
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="mb-6 leading-relaxed">
                {block.text}
              </p>
            );
          })}
        </div>
      </article>
    </main>
  );
}
