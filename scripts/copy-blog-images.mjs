import fs from "fs";
import path from "path";

const contentDir = path.join(process.cwd(), "content");
const outputDir = path.join(process.cwd(), "public", "blog-images");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

fs.rmSync(outputDir, { recursive: true, force: true });

for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const postDir = path.join(contentDir, entry.name);
  if (!fs.existsSync(path.join(postDir, "content.md"))) continue;

  for (const file of fs.readdirSync(postDir, { withFileTypes: true })) {
    if (!file.isFile() || !supportedExtensions.has(path.extname(file.name).toLowerCase())) continue;

    const resizedPath = path.join(postDir, ".resized", file.name);
    const sourcePath = fs.existsSync(resizedPath) ? resizedPath : path.join(postDir, file.name);
    const outputPath = path.join(outputDir, entry.name, file.name);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.copyFileSync(sourcePath, outputPath);
  }
}
