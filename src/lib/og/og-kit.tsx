import { ImageResponse } from "next/og";

/**
 * Shared building blocks for the site's Open Graph / Twitter cards so the
 * story card and the site-level cards stay visually identical.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Site palette (oklch tokens converted to hex — Satori can't parse oklch).
export const OG_COLORS = {
  base: "#0b0b13", // --background ~oklch(0.155 0.022 285)
  title: "#ECECF1", // --foreground
  muted: "#A6A6B7", // --muted-foreground
  accent: "#8b8cf8", // --primary (indigo/violet)
  faint: "#54546a",
};

/** Dark, violet-tinted backdrop with soft glows + edge vignette. */
export function OgBackdrop() {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: OG_COLORS.base,
        backgroundImage:
          "radial-gradient(900px circle at 18% 22%, rgba(99,102,241,0.20) 0%, transparent 55%)," +
          "radial-gradient(900px circle at 85% 88%, rgba(139,92,246,0.16) 0%, transparent 55%)," +
          "radial-gradient(1200px circle at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)",
        display: "flex",
      }}
    />
  );
}

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  style: "italic" | "normal";
  weight: 500;
};

/**
 * Load a Google Font subset to just the glyphs we render (via `&text=`), so the
 * cards match the site fonts cheaply. Returns null on failure (falls back to
 * Satori's default font).
 */
async function loadGoogleFont(
  family: string,
  axis: string,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      `${family}:${axis}`
    )}&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      })
    ).text();
    const match = css.match(
      /src: url\((https:\/\/[^)]+)\) format\('(?:opentype|truetype)'\)/
    );
    if (!match) return null;
    return await (await fetch(match[1])).arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Load the site's serif (Newsreader italic) and sans (Nunito Sans), each subset
 * to the text that uses it. `serifText`/`sansText` should contain every glyph
 * rendered in that family.
 */
export async function loadOgFonts(
  serifText: string,
  sansText: string
): Promise<OgFont[]> {
  const [serif, sans] = await Promise.all([
    loadGoogleFont("Newsreader", "ital,wght@1,500", serifText),
    loadGoogleFont("Nunito Sans", "wght@500", sansText),
  ]);
  return [
    serif && {
      name: "Newsreader",
      data: serif,
      style: "italic" as const,
      weight: 500 as const,
    },
    sans && {
      name: "Nunito Sans",
      data: sans,
      style: "normal" as const,
      weight: 500 as const,
    },
  ].filter(Boolean) as OgFont[];
}

const BRAND = "After 2AM";
const TAGLINE = "Midnight whispers & late-night confessions";

/**
 * The site-level card (homepage, Twitter, any page without its own image).
 * Same look as the story card, with the brand as the hero.
 */
export async function siteOgImage() {
  const fonts = await loadOgFonts(
    BRAND,
    `${TAGLINE.toUpperCase()} AFTER2AMSTORIES.COM`
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          padding: "90px",
        }}
      >
        <OgBackdrop />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "34px",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontSize: "108px",
              color: OG_COLORS.title,
              lineHeight: 1.05,
            }}
          >
            {BRAND}
          </div>
          <div
            style={{
              width: "80px",
              height: "2px",
              backgroundColor: OG_COLORS.accent,
              opacity: 0.5,
              display: "flex",
            }}
          />
          <div
            style={{
              fontFamily: "Nunito Sans",
              fontSize: "24px",
              color: OG_COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            {TAGLINE}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "46px",
            fontFamily: "Nunito Sans",
            fontSize: "15px",
            color: OG_COLORS.faint,
            textTransform: "uppercase",
            letterSpacing: "0.32em",
            zIndex: 1,
          }}
        >
          after2amstories.com
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}
