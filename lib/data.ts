import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption?: string };

export interface BlogPostWithContent extends BlogPost {
  blocks: ContentBlock[];
}

function parseContentFile(slug: string, raw: string): BlogPostWithContent {
  const lines = raw.split("\n");
  const title = lines[0].trim();
  const date = lines[1].trim();

  // Everything after the title and date
  const body = lines.slice(2).join("\n");

  // Split into blocks by blank lines
  const rawBlocks = body.split(/\n\n+/).filter((b) => b.trim());

  const blocks: ContentBlock[] = [];
  let excerpt = "";

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    const imageMatch = trimmed.match(/^\[([^\]]+)\](?:\(([^)]*)\))?$/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        src: `/api/images/${slug}/${imageMatch[1]}`,
        caption: imageMatch[2] || undefined,
      });
    } else {
      if (!excerpt) excerpt = trimmed;
      blocks.push({ type: "paragraph", text: trimmed });
    }
  }

  return { slug, title, date, excerpt, blocks };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) return [];

  const slugs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const posts: BlogPost[] = [];
  for (const slug of slugs) {
    const filePath = path.join(contentDir, slug, "content.txt");
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { title, date, excerpt } = parseContentFile(slug, raw);
    posts.push({ slug, title, date, excerpt });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPostWithContent | undefined {
  const filePath = path.join(contentDir, slug, "content.txt");
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseContentFile(slug, raw);
}
