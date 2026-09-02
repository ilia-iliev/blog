import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const contentDir = path.join(process.cwd(), "content");
const headerLine = /^([A-Z]+):(.*)$/;

function noteFiles(subdir) {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md");
}

function header(subdir, file) {
  const parsed = {};
  for (const line of fs.readFileSync(path.join(contentDir, subdir, file), "utf8").split("\n")) {
    const match = line.match(headerLine);
    if (!match) break;
    parsed[match[1]] = match[2].trim();
  }
  return parsed;
}

function checkNotes(subdir, keys) {
  const files = noteFiles(subdir);
  const skip = files.length === 0 && `content/${subdir} is not checked out`;

  test(`every note in ${subdir} declares ${keys.join(" and ")}`, { skip }, () => {
    for (const file of files) {
      const parsed = header(subdir, file);
      for (const key of keys) {
        assert.ok(parsed[key], `${subdir}/${file} is missing a ${key} header`);
      }
    }
  });
}

checkNotes("books", ["AUTHOR", "DATE"]);
checkNotes("papers", ["LINK", "DATE"]);
