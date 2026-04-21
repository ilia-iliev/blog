import { getAllBooks } from "@/lib/data";
import Link from "next/link";

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <section className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Books</h1>
        <p className="text-base text-gray-700 mb-2">
          Notes on reading - organized around tips from{" "}
          <em>How to Read a Book</em>
        </p>
        <p className="text-sm text-gray-600">
          I especially recommend titles in <span className="text-black font-semibold">black</span>
        </p>
      </section>

      <ul className="space-y-3">
        {books.map((b) => (
          <li key={b.slug} className="flex items-baseline justify-between gap-4">
            <Link
              href={`/books/${b.slug}`}
              className={`text-lg font-semibold hover:underline underline-offset-2 ${b.recommended ? "text-black" : "text-gray-500"
                }`}
            >
              {b.title}
            </Link>
            <span className="text-sm text-gray-500 tabular-nums shrink-0">{b.date}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
