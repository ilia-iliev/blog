import { getAllPapers } from "@/lib/data";
import Link from "next/link";

export default function PapersPage() {
  const papers = getAllPapers();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <section className="mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Papers</h1>
        <p className="text-base text-gray-700 mb-2">
          Notes on papers I read, using the same four-question structure as books.
        </p>
      </section>

      <ul className="space-y-3">
        {papers.map((p) => (
          <li key={p.slug} className="flex items-baseline justify-between gap-4">
            <Link
              href={`/papers/${p.slug}`}
              className={`text-lg font-semibold hover:underline underline-offset-2 ${p.recommended ? "text-black" : "text-gray-500"
                }`}
            >
              {p.title}
            </Link>
            <span className="text-sm text-gray-500 tabular-nums shrink-0">{p.date}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
