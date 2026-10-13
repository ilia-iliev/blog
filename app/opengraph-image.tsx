import { ogImage, ogSize } from "@/lib/og";
import { siteDescription, siteName } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: siteName, subtitle: siteDescription });
}
