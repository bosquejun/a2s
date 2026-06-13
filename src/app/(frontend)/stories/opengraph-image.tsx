import { OG_CONTENT_TYPE, OG_SIZE, pageOgImage } from "@/lib/og/og-kit";

export const alt = "All Stories — After 2AM Stories";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return pageOgImage({
    title: "All Stories",
    subtitle: "Every story written after 2am",
  });
}
