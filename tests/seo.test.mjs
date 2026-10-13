import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllArticles,
  getAllBooks,
  getAllPapers,
  getAllPosts,
  getBookBySlug,
  getExcerpt,
  getPaperBySlug,
  getPostBySlug,
} from "../lib/data.ts";
import { altFromFilename } from "../lib/images.ts";
import { articleJsonLd, pageMetadata, person, rssFeed, toJsonLd } from "../lib/site.ts";

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
  test(`every entry in ${kind} has an ISO date`, () => {
    const bad = list().filter(({ date }) => !/^\d{4}-\d{2}-\d{2}$/.test(date)).map(({ slug, date }) => `${slug}: ${date}`);
    assert.deepEqual(bad, [], `Dates must be YYYY-MM-DD:\n${bad.join("\n")}`);
  });

  test(`every entry in ${kind} has a description`, () => {
    const missing = list().filter(({ slug }) => !getExcerpt(get(slug).content)).map(({ slug }) => slug);
    assert.deepEqual(missing, [], `No prose paragraph to describe:\n${missing.join("\n")}`);
  });
}

test("page metadata without a title inherits the layout title", () => {
  assert.ok(!("title" in pageMetadata({ path: "/" })));
});

test("articles are attributed to the site author with absolute URLs", () => {
  const article = articleJsonLd({ path: "/blog/x", title: "X", description: "About x.", published: "2026-01-02" });
  assert.equal(article["@type"], "BlogPosting");
  assert.equal(article.headline, "X");
  assert.equal(article.datePublished, "2026-01-02");
  assert.equal(article.url, "https://ilia.foo/blog/x");
  assert.equal(article.author.name, "Ilia Iliev");
});

test("the author links to their profiles", () => {
  assert.ok(person.sameAs.some((url) => url.startsWith("https://github.com/")));
});

test("JSON-LD cannot close its script tag", () => {
  assert.ok(!toJsonLd({ headline: "</script><script>alert(1)</script>" }).includes("<"));
});

test("the feed lists every post and note, newest first", () => {
  const items = [...rssFeed(getAllArticles()).matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) => Date.parse(m[1]));
  assert.equal(items.length, getAllPosts().length + getAllBooks().length + getAllPapers().length);
  assert.deepEqual(items, items.toSorted((a, b) => b - a));
});

test("the feed escapes titles and uses RFC 822 dates", () => {
  const feed = rssFeed([{ path: "/blog/x", title: "A & B <c>", description: "d", published: "2026-01-02" }]);
  assert.match(feed, /<title>A &amp; B &lt;c&gt;<\/title>/);
  assert.match(feed, /<link>https:\/\/ilia\.foo\/blog\/x<\/link>/);
  assert.match(feed, /<pubDate>Fri, 02 Jan 2026 00:00:00 GMT<\/pubDate>/);
});

test("every page advertises the feed", () => {
  assert.equal(pageMetadata({ path: "/" }).alternates.types["application/rss+xml"], "/rss.xml");
});

test("images without alt text are described by their filename", () => {
  assert.equal(altFromFilename("/blog-images/post/FP16_vs_FP8.png"), "FP16 vs FP8");
  assert.equal(altFromFilename("3-agents.png"), "3 agents");
});
