import { getAllPosts } from "@/lib/data";
import PostList from "@/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Intro Section */}
      <section className="mb-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Welcome.
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-gray-800">
          I'm a software engineer and minimalist. This is my digital garden where I share thoughts on technology, design, and living a simple life.
        </p>
      </section>

      {/* Post Lists */}
      <PostList posts={posts} />
    </main>
  );
}
