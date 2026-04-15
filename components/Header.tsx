import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-6 border-b border-black/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-75 transition-opacity">
            My Personal Blog
          </Link>
        </div>
        <nav>
          <ul className="flex text-lg font-medium divide-x divide-black/20">
            <li className="px-4 first:pl-0 last:pr-0">
              <Link href="/" className="hover:underline underline-offset-4">
                Blogpost
              </Link>
            </li>
            <li className="px-4 first:pl-0 last:pr-0">
              <Link href="/about" className="hover:underline underline-offset-4">
                About
              </Link>
            </li>
            <li className="px-4 first:pl-0 last:pr-0">
              <Link href="/books" className="hover:underline underline-offset-4">
                Book Reading
              </Link>
            </li>
            <li className="px-4 first:pl-0 last:pr-0">
              <Link href="/papers" className="hover:underline underline-offset-4">
                Paper Reading
              </Link>
            </li>
            <li className="px-4 first:pl-0 last:pr-0">
              <Link href="/subscribe" className="hover:underline underline-offset-4">
                Subscribe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
