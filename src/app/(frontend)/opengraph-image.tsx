import { OG_CONTENT_TYPE, OG_SIZE, siteOgImage } from "@/lib/og/og-kit";

export const alt = "After 2AM Stories";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return siteOgImage();
}
