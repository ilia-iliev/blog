import Link from 'next/link';
import { BlogPost } from '@/lib/data';

interface PostListProps {
  posts: BlogPost[];
  title: string;
}

export default function PostList({ posts, title }: PostListProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-black/10 pb-2">{title}</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="flex flex-col group cursor-pointer">
             <Link href={`/blog/${post.slug}`}>
                <div className="p-4 border border-black/5 hover:border-black/20 transition-colors rounded-lg h-full">
                  <h3 className="text-xl font-semibold mb-2 group-hover:underline decoration-1 underline-offset-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{post.date}</p>
                  <p className="text-base leading-relaxed">{post.excerpt}</p>
                </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
