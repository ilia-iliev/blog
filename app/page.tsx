import Image from "next/image";
import { getAllPosts } from "@/lib/data";
import PostList from "@/components/PostList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="container mx-auto px-4 pt-2 pb-12">
      <div className="flex justify-center">
        <Image
          src="/me-small.jpg"
          alt="Ilia"
          width={128}
          height={128}
          className="rounded-full"
          priority
        />
      </div>
      <PostList posts={posts} />
    </main>
  );
}
