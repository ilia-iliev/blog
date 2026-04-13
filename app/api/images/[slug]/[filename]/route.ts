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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; filename: string }> }
) {
  const { slug, filename } = await params;

  if (slug.includes("..") || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const imagesDir = path.join(process.cwd(), "content", slug, "images");
  const originalPath = path.join(imagesDir, filename);

  if (!fs.existsSync(originalPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  // SVGs and GIFs: serve as-is (no resizing)
  if (ext === ".svg" || ext === ".gif") {
    const buffer = new Uint8Array(fs.readFileSync(originalPath));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Check if a cached resized version exists
  const resizedDir = path.join(imagesDir, ".resized");
  const resizedPath = path.join(resizedDir, filename);

  if (fs.existsSync(resizedPath)) {
    const buffer = new Uint8Array(fs.readFileSync(resizedPath));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Check if the original needs resizing
  const metadata = await sharp(originalPath).metadata();

  if (!metadata.width || metadata.width <= MAX_WIDTH) {
    const buffer = new Uint8Array(fs.readFileSync(originalPath));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Resize and cache
  const resized = await sharp(originalPath)
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    .toBuffer();

  fs.mkdirSync(resizedDir, { recursive: true });
  fs.writeFileSync(resizedPath, resized);

  return new NextResponse(new Uint8Array(resized), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
