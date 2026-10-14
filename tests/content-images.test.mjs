import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import sharp from "sharp";
import { copyBlogImages, supportedExtensions } from "../scripts/copy-blog-images.mjs";

const contentDir = path.join(process.cwd(), "content");
const noteDirs = ["books", "papers"].map((subdir) => path.join(contentDir, subdir));
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

const markdown = markdownFiles(contentDir).map((markdownPath) => ({
  markdownPath,
  images: localImageReferences(markdownPath),
}));

const referencedImages = new Set(markdown.flatMap((entry) => entry.images));
const imageFiles = fs.readdirSync(contentDir, { recursive: true, withFileTypes: true })
  .filter((entry) =>
    entry.isFile() &&
    supportedExtensions.has(path.extname(entry.name).toLowerCase()),
  )
  .map((entry) => path.join(entry.parentPath, entry.name));

// A post is a content directory holding a content.md, the same shape lib/data.ts
// and the copy script both look for.
const posts = markdown.filter((entry) => path.basename(entry.markdownPath) === "content.md");
const notes = markdown.filter((entry) => noteDirs.includes(path.dirname(entry.markdownPath)));

const publishDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-images-"));
await copyBlogImages(publishDir);
after(() => fs.rmSync(publishDir, { recursive: true, force: true }));

test("published JPEGs apply EXIF orientation before resizing", async () => {
  const fixtureDir = fs.mkdtempSync(path.join(contentDir, "orientation-test-"));
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "oriented-blog-images-"));

  try {
    fs.writeFileSync(path.join(fixtureDir, "content.md"), "![Oriented photo](photo.jpg)");
    await sharp({ create: { width: 1200, height: 600, channels: 3, background: "red" } })
      .composite([{
        input: await sharp({ create: { width: 600, height: 600, channels: 3, background: "blue" } })
          .png().toBuffer(),
        left: 600,
        top: 0,
      }])
      .withMetadata({ orientation: 8 })
      .jpeg()
      .toFile(path.join(fixtureDir, "photo.jpg"));

    await copyBlogImages(outputDir);
    const published = path.join(outputDir, path.basename(fixtureDir), "photo.jpg");
    const metadata = await sharp(published).metadata();
    assert.equal(metadata.width, 600);
    assert.equal(metadata.height, 1200);
    assert.equal(metadata.orientation, undefined);

    // A 90-degree counterclockwise rotation moves the blue half to the top.
    const top = await sharp(published).extract({ left: 300, top: 100, width: 1, height: 1 }).raw().toBuffer();
    const bottom = await sharp(published).extract({ left: 300, top: 1100, width: 1, height: 1 }).raw().toBuffer();
    assert.ok(top[2] > 240 && top[0] < 15, "top should be blue");
    assert.ok(bottom[0] > 240 && bottom[2] < 15, "bottom should be red");
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("local images referenced by Markdown exist", () => {
  const missing = [...referencedImages].filter((imagePath) => !fs.existsSync(imagePath));
  assert.deepEqual(missing, [], `Missing Markdown image files:\n${missing.join("\n")}`);
});

test("every image is referenced by Markdown", () => {
  const unreferenced = imageFiles.filter((imagePath) => !referencedImages.has(imagePath));
  assert.deepEqual(unreferenced, [], `Unreferenced image files:\n${unreferenced.join("\n")}`);
});

// Posts load their images from /blog-images, so a reference the copy script
// does not publish 404s.
test("every post image is published under blog-images", () => {
  const missing = posts.flatMap(({ markdownPath, images }) => {
    const postDir = path.dirname(markdownPath);
    const slug = path.basename(postDir);
    return images
      .map((imagePath) => path.join(slug, path.relative(postDir, imagePath)))
      .filter((published) => !fs.existsSync(path.join(publishDir, published)));
  });

  assert.deepEqual(missing, [], `Post images missing from /blog-images:\n${missing.join("\n")}`);
});

// Book and paper pages render Markdown without an imageBasePath, so a relative
// image in a note resolves against the page URL and breaks.
test("notes reference no local images", () => {
  const offenders = notes
    .filter((entry) => entry.images.length > 0)
    .map((entry) => path.relative(contentDir, entry.markdownPath));

  assert.deepEqual(offenders, [], `Notes cannot serve local images:\n${offenders.join("\n")}`);
});
