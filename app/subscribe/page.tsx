"use client";

export default function Subscribe() {
  return (
    <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-xl w-full text-center">
        <p className="text-xl mb-8 text-gray-700">
          Get notified when I post anything
        </p>

        <form className="flex flex-col sm:flex-row gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-grow px-4 py-3 bg-transparent border-2 border-black focus:outline-none focus:ring-2 focus:ring-black/20 rounded-none placeholder-gray-500"
            required
          />
          <button
            type="submit"
            className="px-8 py-3 bg-black text-[#F0EAD6] font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Unsubscribe any time.
        </p>
      </div>
    </main>
  );
}
