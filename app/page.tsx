import { getAllPosts } from "@/lib/data";
import PostList from "@/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Post Lists */}
      <PostList posts={posts} />
    </main>
  );
}
