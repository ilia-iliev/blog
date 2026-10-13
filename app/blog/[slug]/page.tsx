import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import { getAllPosts, getPostBySlug, toArticle } from "@/lib/data";
import { articleJsonLd, pageMetadata } from "@/lib/site";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return pageMetadata(toArticle("blog", post));
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <JsonLd data={articleJsonLd(toArticle("blog", post))} />
      <article>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>
          <time className="text-gray-600">{post.date}</time>
        </header>
        <div className="text-lg max-w-none">
          <Markdown content={post.content} imageBasePath={`/blog-images/${post.slug}`} />
        </div>
      </article>
    </main>
  );
}
