import "server-only";

import sharp from "sharp";

import { OG_COLORS } from "@/lib/og/og-kit";

export const IG_IMAGE_SIZE = 1080;

/**
 * Convert the story's OG PNG into a 1080×1080 JPEG suitable for an Instagram
 * feed post. The landscape OG art is fit (letterboxed) onto a square canvas in
 * the site's base colour so nothing is cropped, then encoded as JPEG (the only
 * format the Instagram feed accepts).
 */
export async function toSquareJpeg(png: Buffer): Promise<Buffer> {
  return sharp(png)
    .resize(IG_IMAGE_SIZE, IG_IMAGE_SIZE, {
      fit: "contain",
      background: OG_COLORS.base,
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}
