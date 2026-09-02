import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const booksDir = path.join(process.cwd(), "content", "books");
const headerLine = /^([A-Z]+):(.*)$/;

function noteFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md");
}

function header(filePath) {
  const parsed = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const match = line.match(headerLine);
    if (!match) break;
    parsed[match[1]] = match[2].trim();
  }
  return parsed;
}

const books = noteFiles(booksDir);

test("every book note names its author", { skip: books.length === 0 && "content/books is not checked out" }, () => {
  for (const file of books) {
    assert.ok(header(path.join(booksDir, file)).AUTHOR, `${file} is missing an AUTHOR header`);
  }
});
