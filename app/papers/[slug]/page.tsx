import { getPaperBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PaperPage({ params }: PageProps) {
  const { slug } = await params;
  const paper = getPaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/papers" className="text-sm text-gray-500 hover:underline mb-8 block">
        ← Back to Papers
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{paper.title}</h1>
          {paper.date && (
            <p className="text-sm text-gray-500 tabular-nums mb-2">{paper.date}</p>
          )}
          {paper.link && (
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all text-sm"
            >
              {paper.link}
            </a>
          )}
        </header>

        <div className="prose prose-base max-w-none">
          {paper.blocks.map((block, i) => {
            if (block.type === "heading") {
              return (
                <h2 key={i} className="text-xl font-bold mt-8 mb-3">
                  {block.text}
                </h2>
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
