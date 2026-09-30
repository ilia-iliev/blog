import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getBookBySlug, getPaperBySlug, getPostBySlug } from "../lib/data.ts";
import { isSafeContentUrl, isSlug } from "../lib/security.mjs";

const postSlug = fs.readdirSync("content", { withFileTypes: true })
  .find((entry) => entry.isDirectory() && fs.existsSync(path.join("content", entry.name, "content.md"))).name;

test("file-backed pages reject slugs outside their collections", () => {
  assert.equal(getBookBySlug("../about"), undefined);
  assert.equal(getPaperBySlug("../books/how_to_read_a_book"), undefined);
  assert.equal(getPostBySlug("../books"), undefined);
});

test("slugs are plain names", () => {
  assert.equal(isSlug(postSlug), true);
  assert.equal(isSlug("../about"), false);
  assert.equal(isSlug("%2e%2e"), false);
});

test("content links cannot use executable or protocol-relative URLs", () => {
  assert.equal(isSafeContentUrl("https://example.com"), true);
  assert.equal(isSafeContentUrl("mailto:hello@example.com"), true);
  assert.equal(isSafeContentUrl("/about"), true);
  assert.equal(isSafeContentUrl("javascript:alert(1)"), false);
  assert.equal(isSafeContentUrl("//example.com"), false);
});
