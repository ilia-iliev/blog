import Link from 'next/link';
import { BlogPost } from '@/lib/data';

export default function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 border-b border-black/10 pb-2">Posts</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="p-4 border border-black/5 hover:border-black/20 transition-colors rounded-lg h-full">
              <h3 className="text-xl font-semibold mb-2 group-hover:underline decoration-1 underline-offset-2">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{post.date}</p>
              <p className="text-base leading-relaxed">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
