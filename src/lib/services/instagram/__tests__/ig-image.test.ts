import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { IG_IMAGE_SIZE, toSquareJpeg } from "../ig-image";

async function makePng(w: number, h: number): Promise<Buffer> {
  return sharp({
    create: { width: w, height: h, channels: 3, background: "#101018" },
  })
    .png()
    .toBuffer();
}

describe("toSquareJpeg", () => {
  it("produces a 1080x1080 JPEG from a landscape PNG", async () => {
    const png = await makePng(1200, 630);
    const jpeg = await toSquareJpeg(png);
    const meta = await sharp(jpeg).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(IG_IMAGE_SIZE);
    expect(meta.height).toBe(IG_IMAGE_SIZE);
  });
});
