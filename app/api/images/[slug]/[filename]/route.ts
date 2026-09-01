import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const MAX_WIDTH = 800;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function imageResponse(buffer: Buffer | Uint8Array, contentType: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  const { slug, filename } = await params;

  if (slug.includes("..") || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const postDir = path.join(process.cwd(), "content", slug);
  const originalPath = path.join(postDir, filename);

  if (!fs.existsSync(originalPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // SVGs and GIFs: serve as-is
  if (ext === ".svg" || ext === ".gif") {
    return imageResponse(fs.readFileSync(originalPath), contentType);
  }

  // Serve cached resized version if available
  const resizedDir = path.join(postDir, ".resized");
  const resizedPath = path.join(resizedDir, filename);

  if (fs.existsSync(resizedPath)) {
    return imageResponse(fs.readFileSync(resizedPath), contentType);
  }

  // Serve original if small enough
  const metadata = await sharp(originalPath).metadata();
  if (!metadata.width || metadata.width <= MAX_WIDTH) {
    return imageResponse(fs.readFileSync(originalPath), contentType);
  }

  // Resize. Re-encoding can produce a larger file than the original (e.g. an
  // image barely over MAX_WIDTH), so only use the resized version when it is
  // actually smaller — otherwise cache and serve the original.
  const resized = await sharp(originalPath)
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    .toBuffer();

  const original = fs.readFileSync(originalPath);
  const best = resized.length < original.length ? resized : original;

  // Best-effort cache. The serverless filesystem (e.g. Vercel) is read-only,
  // so writing throws there; the CDN caches the response anyway via the
  // immutable Cache-Control header.
  try {
    fs.mkdirSync(resizedDir, { recursive: true });
    fs.writeFileSync(resizedPath, best);
  } catch {
    // Couldn't persist the cache; serving the buffer still works.
  }

  return imageResponse(best, contentType);
}
