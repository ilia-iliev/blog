import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const contentDir = path.join(process.cwd(), "content");
const imagePattern = /!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+)(?:\s+["'][^"']*["'])?)\)/g;

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return markdownFiles(filePath);
    return entry.isFile() && path.extname(entry.name) === ".md" ? [filePath] : [];
  });
}

function localImageReferences(markdownPath) {
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const references = [];

  for (const match of markdown.matchAll(imagePattern)) {
    const source = match[1] ?? match[2];
    if (/^(?:https?:)?\/\//.test(source) || source.startsWith("/")) continue;
    references.push(path.normalize(path.join(path.dirname(markdownPath), decodeURIComponent(source))));
  }

  return references;
}

const markdown = markdownFiles(contentDir);
const referencedImages = new Set(markdown.flatMap(localImageReferences));
const pngFiles = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
  .filter((entry) =>
    entry.isFile() &&
    !entry.parentPath.split(path.sep).includes(".resized") &&
    path.extname(entry.name).toLowerCase() === ".png",
  )
  .map((entry) => path.join(entry.parentPath, entry.name));

test("local images referenced by Markdown exist", () => {
  const missing = [...referencedImages].filter((imagePath) => !fs.existsSync(imagePath));
  assert.deepEqual(missing, [], `Missing Markdown image files:\n${missing.join("\n")}`);
});

test("every PNG is referenced by Markdown", () => {
  const unreferenced = pngFiles.filter((imagePath) => !referencedImages.has(imagePath));
  assert.deepEqual(unreferenced, [], `Unreferenced PNG files:\n${unreferenced.join("\n")}`);
});
