import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "Reading Notes", subtitle: "Books and papers, guided by How to Read a Book." });
}
