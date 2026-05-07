import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/data";
import EntryList from "@/components/EntryList";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="container mx-auto px-4 pt-2 pb-12 max-w-3xl">
      <div className="flex justify-center mb-10">
        <Link href="/about" aria-label="About">
          <Image
            src="/me-small.jpg"
            alt="Ilia"
            width={128}
            height={128}
            className="rounded-full"
            priority
          />
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-black/10 pb-2 text-center">Posts</h2>
        <EntryList items={posts} basePath="blog" bold={false} />
      </section>
    </main>
  );
}
