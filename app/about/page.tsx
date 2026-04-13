import Image from "next/image";

export default function About() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center md:items-start">
        <div className="w-full md:w-1/3 flex justify-center">
          <div className="relative w-64 h-64 md:w-full md:h-auto aspect-square rounded-full overflow-hidden border-4 border-black/5">
            <Image
              src="/me.jpg"
              alt="Profile Photo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold mb-6">About Me</h1>
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              I started this blog to document my curiosity. I like AI and I'm looking forward to the future!
            </p>
            <p>
              I'm based in Sofia, Bulgaria. I like to read books and recently started documenting my thoughts on anything I read
              <a href="https://github.com/ilia-iliev/booknote"> here</a>. I keep a similar repo regarding
              <a href="https://github.com/ilia-iliev/papernote"> AI papers</a>.
            </p>

            <p>
              I'm based in Sofia, Bulgaria. I like hiking
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
