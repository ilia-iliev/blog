import Link from "next/link";

export interface EntryListItem {
  slug: string;
  title: string;
  author?: string;
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
          <li key={it.slug} className="flex min-w-0 items-baseline justify-between gap-4">
            <div className="flex min-w-0 items-baseline gap-2">
              <Link
                href={`/${basePath}/${it.slug}`}
                className={`min-w-0 truncate text-lg hover:underline underline-offset-2 ${
                  bold ? "font-semibold" : ""
                } ${muted ? "text-gray-500" : "text-black"}`}
              >
                {it.title}
              </Link>
              {it.author && (
                <span className="shrink-0 text-[15px] text-gray-500 max-[480px]:hidden">
                  {it.author.split(",")[0]}
                </span>
              )}
            </div>
            <span className="shrink-0 text-sm text-gray-500 tabular-nums max-sm:hidden">
              {it.date}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
