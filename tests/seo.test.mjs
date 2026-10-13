import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllBooks,
  getAllPapers,
  getAllPosts,
  getBookBySlug,
  getExcerpt,
  getPaperBySlug,
  getPostBySlug,
} from "../lib/data.ts";
import { pageMetadata } from "../lib/site.ts";

test("excerpt skips headings and images and strips markdown", () => {
  const markdown = "# Heading\n\n![](a.png)\n\nSee **this** [link](https://x.y) and `code`.\n\nSecond paragraph.";
  assert.equal(getExcerpt(markdown), "See this link and code.");
});

test("excerpt flattens list items", () => {
  assert.equal(getExcerpt("- one\n- two\n1. three"), "one two three");
});

test("excerpt is cut at a word boundary", () => {
  const excerpt = getExcerpt("word ".repeat(100));
  assert.ok(excerpt.length <= 160, `excerpt is ${excerpt.length} chars`);
  assert.match(excerpt, /word…$/);
});

for (const [kind, list, get] of [
  ["blog", getAllPosts, getPostBySlug],
  ["books", getAllBooks, getBookBySlug],
  ["papers", getAllPapers, getPaperBySlug],
]) {
  test(`every entry in ${kind} has a description`, () => {
    const missing = list().filter(({ slug }) => !getExcerpt(get(slug).content)).map(({ slug }) => slug);
    assert.deepEqual(missing, [], `No prose paragraph to describe:\n${missing.join("\n")}`);
  });
}

test("page metadata without a title inherits the layout title", () => {
  assert.ok(!("title" in pageMetadata({ path: "/" })));
});
