import fs from "fs";
import path from "path";
import sharp from "sharp";

const MAX_WIDTH = 800;
const contentDir = path.join(process.cwd(), "content");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function imageFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return imageFiles(filePath);
    return supportedExtensions.has(path.extname(entry.name).toLowerCase()) ? [filePath] : [];
  });
}

let generated = 0;
for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const imagesDir = path.join(contentDir, entry.name, "images");
  if (!fs.existsSync(imagesDir)) continue;

  const resizedDir = path.join(imagesDir, ".resized");
  fs.rmSync(resizedDir, { recursive: true, force: true });

  for (const sourcePath of imageFiles(imagesDir)) {
    const metadata = await sharp(sourcePath).metadata();
    if (!metadata.width || metadata.width <= MAX_WIDTH) continue;

    const resized = await sharp(sourcePath)
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
      .toBuffer();
    const original = fs.readFileSync(sourcePath);
    if (resized.length >= original.length) continue;

    const outputPath = path.join(resizedDir, path.relative(imagesDir, sourcePath));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, resized);
    generated++;
  }
}

console.log(`Regenerated ${generated} resized image${generated === 1 ? "" : "s"}.`);
