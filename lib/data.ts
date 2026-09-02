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

function humanizeSlug(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => (/^[a-z]/.test(word) ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
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
  const slug = file.replace(/\.md$/, "");
  const { header, content } = parseNote(fs.readFileSync(path.join(contentDir, subdir, file), "utf-8"));
  return {
    slug,
    title: header.TITLE ?? humanizeSlug(slug),
    author: header.AUTHOR,
    link: header.LINK,
    content,
  };
}

interface NoteMeta {
  date: string;
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

  const meta = loadNotesMeta();
  const recommended = loadRecommended();
  const today = new Date().toISOString().slice(0, 10);
  let mutated = false;

  const entries = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md")
    .map((file) => {
      const key = `${subdir}/${file}`;
      if (!meta[key]) {
        meta[key] = { date: today };
        mutated = true;
      }
      const { slug, title, author } = readNote(subdir, file);
      return { slug, title, author, date: meta[key].date, recommended: recommended.has(key) };
    });

  if (mutated) saveNotesMeta(meta);
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

function getNote(slug: string, subdir: "books" | "papers") {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(contentDir, subdir, file))) return undefined;

  const key = `${subdir}/${file}`;
  return {
    ...readNote(subdir, file),
    date: loadNotesMeta()[key]?.date ?? "",
    recommended: loadRecommended().has(key),
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
