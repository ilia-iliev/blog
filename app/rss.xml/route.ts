import { getAllArticles } from "@/lib/data";
import { rssFeed } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return new Response(rssFeed(getAllArticles()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
