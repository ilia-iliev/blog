import Link from "next/link";

export interface EntryListItem {
  slug: string;
  title: string;
  date: string;
  recommended?: boolean;
}

export default function EntryList({
  items,
  basePath,
  bold = true,
}: {
  items: EntryListItem[];
  basePath: string;
  bold?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const muted = it.recommended === false;
        return (
          <li key={it.slug} className="flex items-baseline justify-between gap-4">
            <Link
              href={`/${basePath}/${it.slug}`}
              className={`text-lg hover:underline underline-offset-2 ${
                bold ? "font-semibold" : ""
              } ${muted ? "text-gray-500" : "text-black"}`}
            >
              {it.title}
            </Link>
            <span className="text-sm text-gray-500 tabular-nums shrink-0">{it.date}</span>
          </li>
        );
      })}
    </ul>
  );
}
