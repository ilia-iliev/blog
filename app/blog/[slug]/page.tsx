import { getPostBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function renderInline(text: string): React.ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    const external = /^https?:\/\//.test(href);
    parts.push(
      <a
        key={key++}
        href={href}
        className="underline text-blue-600 hover:text-blue-800"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="text-sm text-gray-500 hover:underline mb-8 block">
        ← Back to Home
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
          <time className="text-gray-600">{post.date}</time>
        </header>

        <div className="prose prose-lg max-w-none">
          {post.blocks.map((block, i) => {
            if (block.type === "paragraph") {
              return <p key={i} className="mb-6 leading-relaxed">{renderInline(block.text)}</p>;
            }
            return (
              <figure key={i} className="my-8 flex flex-col items-center">
                <img
                  src={block.src}
                  alt={block.caption || ""}
                  className="max-w-full h-auto rounded-lg"
                />
                {block.caption && (
                  <figcaption className="text-sm text-gray-500 mt-2 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </article>
    </main>
  );
}
