import { getAllBooks, getAllPapers } from "@/lib/data";
import EntryList from "@/components/EntryList";

export default function ReadingPage() {
  const books = getAllBooks();
  const papers = getAllPapers();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <section className="mb-10">
        <p className="text-base text-gray-700 mb-2">
          Notes on what I read - organized around tips from{" "}
          <em>How to Read a Book</em>.
        </p>
        <p className="text-sm text-gray-600">
          I especially recommend titles in{" "}
          <span className="text-black font-semibold">black</span>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 border-b border-black/10 pb-2 text-center">
          Books
        </h2>
        <EntryList items={books} basePath="books" />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-black/10 pb-2 text-center">
          Papers
        </h2>
        <EntryList items={papers} basePath="papers" />
      </section>
    </main>
  );
}
