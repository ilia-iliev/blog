import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");
const notesFile = path.join(contentDir, "notes.json");
const recommendedFile = path.join(contentDir, "recommended.json");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
}

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; src: string; caption?: string };

export interface BlogPostWithContent extends BlogPost {
  blocks: ContentBlock[];
}

function parseContentFile(slug: string, raw: string): BlogPostWithContent {
  const lines = raw.split("\n");
  const title = lines[0].trim();
  const date = lines[1].trim();

  const body = lines.slice(2).join("\n");
  const rawBlocks = body.split(/\n\n+/).filter((b) => b.trim());

  const blocks: ContentBlock[] = rawBlocks.map((block) => {
    const trimmed = block.trim();
    const imageMatch = trimmed.match(/^\[([^\]]+)\](?:\(([^)]*)\))?$/);
    if (imageMatch) {
      return {
        type: "image",
        src: `/api/images/${slug}/${imageMatch[1]}`,
        caption: imageMatch[2] || undefined,
      };
    }
    const headingMatch = trimmed.match(/^##\s*(.+)$/);
    if (headingMatch) {
      return { type: "heading", text: headingMatch[1].trim() };
    }
    const lines = trimmed.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return { type: "list", items: lines.map((line) => line.slice(2).trim()) };
    }
    return { type: "paragraph", text: trimmed };
  });

  return { slug, title, date, blocks };
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
    const { title, date } = parseContentFile(slug, raw);
    posts.push({ slug, title, date });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPostWithContent | undefined {
  const filePath = path.join(contentDir, slug, "content.txt");
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseContentFile(slug, raw);
}

export type NoteBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export interface NoteEntry {
  slug: string;
  title: string;
  author?: string;
  date: string;
  recommended: boolean;
}

export interface BookEntry extends NoteEntry {
  blocks: NoteBlock[];
}

export interface PaperEntry extends NoteEntry {
  link?: string;
  blocks: NoteBlock[];
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function parseNote(raw: string): { link?: string; blocks: NoteBlock[] } {
  const lines = raw.split("\n");
  let link: string | undefined;
  let start = 0;

  if (lines[0]?.startsWith("LINK:")) {
    link = lines[0].slice("LINK:".length).trim();
    start = 1;
    while (start < lines.length && lines[start].trim() === "") start++;
  }

  const blocks: NoteBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };
  const flush = () => {
    flushParagraph();
    flushList();
  };

  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const bullet = line.match(/^\s*-\s+(.*)$/);
    if (line.startsWith("# ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(2).trim() });
    } else if (line.trim() === "") {
      flush();
    } else if (bullet) {
      flushParagraph();
      listItems.push(bullet[1].trim());
    } else if (listItems.length) {
      listItems[listItems.length - 1] += " " + line.trim();
    } else {
      paragraph.push(line.trim());
    }
  }
  flush();

  return { link, blocks };
}

interface NoteMeta {
  date: string;
  title?: string;
  author?: string;
}

function loadNotesMeta(): Record<string, NoteMeta> {
  try {
    return JSON.parse(fs.readFileSync(notesFile, "utf-8"));
  } catch {
    return {};
  }
}

function saveNotesMeta(meta: Record<string, NoteMeta>) {
  fs.writeFileSync(notesFile, JSON.stringify(meta, null, 2) + "\n");
}

function resolveNote(key: string, slug: string): { title: string; author?: string; date: string } {
  const meta = loadNotesMeta()[key];
  return {
    title: meta?.title ?? humanizeSlug(slug),
    author: meta?.author,
    date: meta?.date ?? "",
  };
}

function loadRecommended(): Set<string> {
  try {
    const arr = JSON.parse(fs.readFileSync(recommendedFile, "utf-8"));
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function listNotes(subdir: string): NoteEntry[] {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];

  const meta = loadNotesMeta();
  const recommended = loadRecommended();
  const today = new Date().toISOString().slice(0, 10);
  let mutated = false;

  const entries = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const key = `${subdir}/${f}`;
      if (!meta[key]) {
        meta[key] = { date: today };
        mutated = true;
      }
      return {
        slug,
        title: meta[key].title ?? humanizeSlug(slug),
        author: meta[key].author,
        date: meta[key].date,
        recommended: recommended.has(key),
      };
    });

  if (mutated) saveNotesMeta(meta);

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllBooks(): NoteEntry[] {
  return listNotes("books");
}

export function getBookBySlug(slug: string): BookEntry | undefined {
  const filePath = path.join(contentDir, "books", `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  const { blocks } = parseNote(fs.readFileSync(filePath, "utf-8"));
  const key = `books/${slug}.md`;
  const { title, author, date } = resolveNote(key, slug);
  const recommended = loadRecommended().has(key);
  return { slug, title, author, date, recommended, blocks };
}

export function getAllPapers(): NoteEntry[] {
  return listNotes("papers");
}

export function getPaperBySlug(slug: string): PaperEntry | undefined {
  const filePath = path.join(contentDir, "papers", `${slug}.md`);
  if (!fs.existsSync(filePath)) return undefined;
  const { link, blocks } = parseNote(fs.readFileSync(filePath, "utf-8"));
  const key = `papers/${slug}.md`;
  const { title, date } = resolveNote(key, slug);
  const recommended = loadRecommended().has(key);
  return { slug, title, date, recommended, link, blocks };
}

export type AboutSegment =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export function getAboutParagraphs(): AboutSegment[][] {
  const filePath = path.join(contentDir, "about.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const paragraphs = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

  return paragraphs.map((p) => {
    const segments: AboutSegment[] = [];
    let last = 0;
    for (const m of p.matchAll(linkRe)) {
      if (m.index! > last) segments.push({ type: "text", text: p.slice(last, m.index!) });
      segments.push({ type: "link", text: m[1], href: m[2] });
      last = m.index! + m[0].length;
    }
    if (last < p.length) segments.push({ type: "text", text: p.slice(last) });
    return segments;
  });
}
