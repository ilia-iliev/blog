import { getAllBooks, getAllPapers, NoteEntry } from "@/lib/data";
import Link from "next/link";

function NoteList({ items, basePath }: { items: NoteEntry[]; basePath: string }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.slug} className="flex items-baseline justify-between gap-4">
          <Link
            href={`/${basePath}/${it.slug}`}
            className={`text-lg font-semibold hover:underline underline-offset-2 ${
              it.recommended ? "text-black" : "text-gray-500"
            }`}
          >
            {it.title}
          </Link>
          <span className="text-sm text-gray-500 tabular-nums shrink-0">{it.date}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReadingPage() {
  const books = getAllBooks();
  const papers = getAllPapers();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <section className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Reading</h1>
        <p className="text-base text-gray-700 mb-2">
          Notes on what I read - organized around tips from <em>How to Read a Book</em>.
        </p>
        <p className="text-sm text-gray-600">
          I especially recommend titles in <span className="text-black font-semibold">black</span>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 border-b border-black/10 pb-2">Books</h2>
        <NoteList items={books} basePath="books" />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-black/10 pb-2">Papers</h2>
        <NoteList items={papers} basePath="papers" />
      </section>
    </main>
  );
}
