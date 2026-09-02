import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");
const recommendedFile = path.join(contentDir, "recommended.json");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

function parsePost(raw: string): Omit<BlogPostWithContent, "slug"> {
  const lines = raw.split("\n");
  return {
    title: lines[0].trim(),
    date: lines[1].trim(),
    content: lines.slice(2).join("\n").trim(),
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) return [];

  const posts = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const filePath = path.join(contentDir, entry.name, "content.md");
      if (!fs.existsSync(filePath)) return [];
      const { title, date } = parsePost(fs.readFileSync(filePath, "utf-8"));
      return [{ slug: entry.name, title, date }];
    });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPostWithContent | undefined {
  const filePath = path.join(contentDir, slug, "content.md");
  if (!fs.existsSync(filePath)) return undefined;
  return { slug, ...parsePost(fs.readFileSync(filePath, "utf-8")) };
}

export interface NoteEntry {
  slug: string;
  title: string;
  author?: string;
  date: string;
  recommended: boolean;
}

export interface BookEntry extends NoteEntry {
  content: string;
}

export interface PaperEntry extends NoteEntry {
  link?: string;
  content: string;
}

const headerLine = /^([A-Z]+):(.*)$/;

function parseNote(raw: string): { header: Record<string, string>; content: string } {
  const lines = raw.split("\n");
  const header: Record<string, string> = {};
  let start = 0;

  for (; start < lines.length; start++) {
    const match = lines[start].match(headerLine);
    if (!match) break;
    header[match[1]] = match[2].trim();
  }

  return { header, content: lines.slice(start).join("\n").trim() };
}

function readNote(subdir: string, file: string) {
  const { header, content } = parseNote(fs.readFileSync(path.join(contentDir, subdir, file), "utf-8"));
  return {
    slug: file.replace(/\.md$/, ""),
    title: header.TITLE,
    author: header.AUTHOR,
    link: header.LINK,
    date: header.DATE,
    content,
  };
}

function loadRecommended(): Set<string> {
  try {
    const entries = JSON.parse(fs.readFileSync(recommendedFile, "utf-8"));
    return new Set(Array.isArray(entries) ? entries : []);
  } catch {
    return new Set();
  }
}

function listNotes(subdir: string): NoteEntry[] {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];

  const recommended = loadRecommended();

  const entries = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md")
    .map((file) => {
      const { slug, title, author, date } = readNote(subdir, file);
      return { slug, title, author, date, recommended: recommended.has(`${subdir}/${file}`) };
    });

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

function getNote(slug: string, subdir: "books" | "papers") {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(contentDir, subdir, file))) return undefined;

  return {
    ...readNote(subdir, file),
    recommended: loadRecommended().has(`${subdir}/${file}`),
  };
}

export function getAllBooks(): NoteEntry[] {
  return listNotes("books");
}

export function getBookBySlug(slug: string): BookEntry | undefined {
  return getNote(slug, "books");
}

export function getAllPapers(): NoteEntry[] {
  return listNotes("papers");
}

export function getPaperBySlug(slug: string): PaperEntry | undefined {
  return getNote(slug, "papers");
}

export type AboutSegment =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string };

export function getAboutParagraphs(): AboutSegment[][] {
  const filePath = path.join(contentDir, "about.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const paragraphs = raw.split(/\n\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;

  return paragraphs.map((paragraph) => {
    const segments: AboutSegment[] = [];
    let last = 0;
    for (const match of paragraph.matchAll(linkRe)) {
      if (match.index! > last) segments.push({ type: "text", text: paragraph.slice(last, match.index!) });
      segments.push({ type: "link", text: match[1], href: match[2] });
      last = match.index! + match[0].length;
    }
    if (last < paragraph.length) segments.push({ type: "text", text: paragraph.slice(last) });
    return segments;
  });
}
