import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-6 border-b border-black/10">
      <div className="w-full px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link href="/" className="text-2xl font-mono tracking-tighter hover:opacity-75 transition-opacity">
          ilia@home:$
        </Link>
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
              <Link href="/reading" className="hover:underline underline-offset-4">
                Reading
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
