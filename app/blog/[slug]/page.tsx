import Markdown from "@/components/Markdown";
import { getPostBySlug } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
          <time className="text-gray-600">{post.date}</time>
        </header>
        <div className="text-lg max-w-none">
          <Markdown
            content={post.content}
            imageBasePath={
              process.env.NODE_ENV === "production"
                ? `/blog-images/${post.slug}`
                : `/api/images/${post.slug}`
            }
          />
        </div>
      </article>
    </main>
  );
}
