import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const MAX_WIDTH = 800;
const contentDir = path.join(process.cwd(), "content");
export const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);
const encoders = {
  ".jpg": (image) => image.jpeg({ mozjpeg: true }),
  ".jpeg": (image) => image.jpeg({ mozjpeg: true }),
  ".png": (image) => image.png({ palette: true }),
  ".webp": (image) => image.webp(),
};

// Downscale to MAX_WIDTH and re-encode (PNGs as a palette). Keep the original
// when that does not make it smaller.
async function optimize(sourcePath) {
  const original = fs.readFileSync(sourcePath);
  const encode = encoders[path.extname(sourcePath).toLowerCase()];
  if (!encode) return original;

  const optimized = await encode(sharp(original).resize(MAX_WIDTH, undefined, { withoutEnlargement: true })).toBuffer();
  return optimized.length < original.length ? optimized : original;
}

export async function copyBlogImages(outputDir) {
  fs.rmSync(outputDir, { recursive: true, force: true });

  for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const postDir = path.join(contentDir, entry.name);
    if (!fs.existsSync(path.join(postDir, "content.md"))) continue;

    for (const file of fs.readdirSync(postDir, { withFileTypes: true })) {
      if (!file.isFile() || !supportedExtensions.has(path.extname(file.name).toLowerCase())) continue;

      const outputPath = path.join(outputDir, entry.name, file.name);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, await optimize(path.join(postDir, file.name)));
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await copyBlogImages(path.join(process.cwd(), "public", "blog-images"));
}
