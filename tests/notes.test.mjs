import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  getAllBooks,
  getAllPapers,
  getAllPosts,
  getBookBySlug,
  getPaperBySlug,
  getPostBySlug,
} from "../lib/data.ts";

const contentDir = path.join(process.cwd(), "content");
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const headerLine = /^([A-Z]+):/;
const knownHeaders = new Set(["TITLE", "AUTHOR", "LINK", "DATE"]);

// Whatever the parser treats as a header is stripped from the body, so an
// unexpected key silently swallows the line it appears on.
function leadingHeaderKeys(filePath) {
  const keys = [];
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const match = line.match(headerLine);
    if (!match) break;
    keys.push(match[1]);
  }
  return keys;
}

function checkNotes(subdir, list, get, required) {
  const entries = list();
  const skip = entries.length === 0 && `content/${subdir} is not checked out`;
  const notes = () => entries.map((entry) => [entry.slug, get(entry.slug)]);

  test(`every note in ${subdir} resolves by slug`, { skip }, () => {
    const unresolved = entries.filter((entry) => !get(entry.slug)).map((entry) => entry.slug);
    assert.deepEqual(unresolved, [], `Slugs listed but not readable back:\n${unresolved.join("\n")}`);
  });

  test(`every note in ${subdir} declares ${required.join(", ")}`, { skip }, () => {
    for (const [slug, note] of notes()) {
      for (const field of required) {
        assert.ok(note[field], `${subdir}/${slug}.md is missing a ${field.toUpperCase()} header`);
      }
      assert.ok(note.content, `${subdir}/${slug}.md has no body`);
    }
  });

  test(`every note in ${subdir} declares only known headers`, { skip }, () => {
    for (const [slug] of notes()) {
      const unknown = leadingHeaderKeys(path.join(contentDir, subdir, `${slug}.md`))
        .filter((key) => !knownHeaders.has(key));
      assert.deepEqual(unknown, [], `${subdir}/${slug}.md starts with unrecognised headers: ${unknown.join(", ")}`);
    }
  });

  checkDatedList(subdir, entries, skip);
}

// Notes and posts are ordered by comparing date strings, so a date that is not
// a plain ISO day sorts into the wrong place without erroring.
function checkDatedList(label, entries, skip = false) {
  test(`every date in ${label} is an ISO day`, { skip }, () => {
    const malformed = entries.filter((entry) => !isoDate.test(entry.date)).map((entry) => `${entry.slug}: ${entry.date}`);
    assert.deepEqual(malformed, [], `Dates that are not YYYY-MM-DD:\n${malformed.join("\n")}`);
  });

  test(`${label} are listed newest first`, { skip }, () => {
    const dates = entries.map((entry) => entry.date);
    assert.deepEqual(dates, [...dates].sort().reverse());
  });
}

checkNotes("books", getAllBooks, getBookBySlug, ["title", "author", "date"]);
checkNotes("papers", getAllPapers, getPaperBySlug, ["title", "link", "date"]);

const posts = getAllPosts();
checkDatedList("posts", posts);

test("every post resolves by slug and has a title", () => {
  for (const post of posts) {
    const full = getPostBySlug(post.slug);
    assert.ok(full, `${post.slug} is listed but not readable back`);
    assert.ok(full.title, `${post.slug} has no title on its first line`);
    assert.ok(full.content, `${post.slug} has no body`);
  }
});

// loadRecommended() swallows every error, so a typo here silently drops the
// whole list and a renamed note silently loses its recommendation.
test("recommended.json lists existing notes", () => {
  const entries = JSON.parse(fs.readFileSync(path.join(contentDir, "recommended.json"), "utf8"));
  assert.ok(Array.isArray(entries), "recommended.json must hold an array");

  for (const entry of entries) {
    assert.equal(typeof entry, "string", `recommended.json holds a non-string entry: ${JSON.stringify(entry)}`);
  }

  const checkedOut = entries.filter((entry) => fs.existsSync(path.join(contentDir, path.dirname(entry))));
  const missing = checkedOut.filter((entry) => !fs.existsSync(path.join(contentDir, entry)));
  assert.deepEqual(missing, [], `Recommended notes that no longer exist:\n${missing.join("\n")}`);
});
