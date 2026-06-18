import { ImageResponse } from "next/og";

import { loadOgFonts, OG_COLORS, OgBackdrop } from "@/lib/og/og-kit";

/**
 * Square (1080×1080) slide renderers for the Instagram carousel. The cover slide
 * reuses the OG card design (`storyOgImage`); these cover the body and the
 * closing call-to-action, sharing the backdrop, palette and fonts so the whole
 * carousel reads as one set.
 */

export const IG_SQUARE_SIZE = { width: 1080, height: 1080 };

const BRAND = "After 2AM Stories";

/** A body slide: a paginated chunk of the story, set as serif italic. */
export async function carouselContentImage({
  text,
  page,
  pageCount,
  accent,
}: {
  text: string;
  page: number;
  pageCount: number;
  accent?: string;
}) {
  const fonts = await loadOgFonts(
    text,
    `${BRAND.toUpperCase()} ${page} / ${pageCount}`
  );
  const fontSize = text.length > 320 ? 38 : text.length > 200 ? 46 : 54;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        padding: "96px",
      }}
    >
      <OgBackdrop accent={accent} />

      <div
        style={{
          position: "absolute",
          top: "56px",
          fontFamily: "Nunito Sans",
          fontSize: "16px",
          color: OG_COLORS.faint,
          textTransform: "uppercase",
          letterSpacing: "0.32em",
        }}
      >
        {BRAND}
      </div>

      <div
        style={{
          display: "flex",
          fontFamily: "Newsreader",
          fontStyle: "italic",
          fontSize: `${fontSize}px`,
          lineHeight: 1.42,
          color: OG_COLORS.title,
          textAlign: "center",
          maxWidth: "860px",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "56px",
          fontFamily: "Nunito Sans",
          fontSize: "16px",
          color: OG_COLORS.faint,
          letterSpacing: "0.2em",
        }}
      >
        {`${page} / ${pageCount}`}
      </div>
    </div>,
    {
      ...IG_SQUARE_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}

/** The closing slide: a "read the full story" call-to-action. */
export async function carouselCtaImage({ accent }: { accent?: string } = {}) {
  const headline = "Read the full story";
  const sub = "Link in bio";
  const fonts = await loadOgFonts(
    headline,
    `${sub.toUpperCase()} ${BRAND.toUpperCase()} AFTER2AMSTORIES.COM`
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "34px",
        fontFamily: "serif",
        padding: "96px",
      }}
    >
      <OgBackdrop accent={accent} />

      <div
        style={{
          fontFamily: "Newsreader",
          fontStyle: "italic",
          fontSize: "72px",
          color: OG_COLORS.title,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        {headline}
      </div>
      <div
        style={{
          width: "80px",
          height: "2px",
          backgroundColor: accent ?? OG_COLORS.accent,
          opacity: accent ? 0.7 : 0.5,
          display: "flex",
        }}
      />
      <div
        style={{
          fontFamily: "Nunito Sans",
          fontSize: "26px",
          color: OG_COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
        }}
      >
        {sub}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "56px",
          fontFamily: "Nunito Sans",
          fontSize: "16px",
          color: OG_COLORS.faint,
          textTransform: "uppercase",
          letterSpacing: "0.32em",
        }}
      >
        {BRAND}
      </div>
    </div>,
    {
      ...IG_SQUARE_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}
