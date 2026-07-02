import { ImageResponse } from "next/og";
import { CATEGORY_ACCENTS } from "@/lib/content/taxonomy";
import type { Story } from "@/lib/types";

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

/** Convert a `#rrggbb` hex string into an `rgba(...)` string at the given alpha. */
function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Dark, glow-tinted backdrop with soft corner glows + edge vignette. Defaults to
 * the brand violet; pass `accent` (a `#rrggbb` hex) to tint the glows per
 * section, e.g. for a category card.
 */
export function OgBackdrop({ accent }: { accent?: string } = {}) {
  const glow1 = accent ? rgba(accent, 0.22) : "rgba(99,102,241,0.20)";
  const glow2 = accent ? rgba(accent, 0.15) : "rgba(139,92,246,0.16)";
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: OG_COLORS.base,
        backgroundImage:
          `radial-gradient(900px circle at 18% 22%, ${glow1} 0%, transparent 55%),` +
          `radial-gradient(900px circle at 85% 88%, ${glow2} 0%, transparent 55%),` +
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

const BRAND = "After 2AM Stories";
const TAGLINE = "Midnight whispers & late-night confessions";
const DOMAIN = "after2amstories.com";

/**
 * The per-story card: the social hook as the hero, with a demoted title + meta
 * footer. Pass `null` (story not found) to get the plain wordmark card.
 */
export async function storyOgImage(story: Story | null) {
  if (!story) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <OgBackdrop />
        <div
          style={{
            fontSize: "52px",
            fontStyle: "italic",
            color: OG_COLORS.title,
          }}
        >
          {BRAND}
        </div>
      </div>,
      { ...OG_SIZE }
    );
  }

  const title =
    story.title.length > 64 ? story.title.substring(0, 61) + "…" : story.title;
  // Prefer the dedicated social hook; fall back to the excerpt.
  const rawHook = story.hook || story.excerpt || "";
  const hook = rawHook.length > 140 ? rawHook.substring(0, 137) + "…" : rawHook;
  const eyebrow = [story.mood, story.categories[0]]
    .filter(Boolean)
    .join("  ·  ");
  // Tint the card to the story's primary category, so a horror piece glows
  // crimson and a romance one glows rose. Falls back to the brand violet.
  const accent = story.categories[0]
    ? CATEGORY_ACCENTS[story.categories[0]]
    : undefined;

  const fonts = await loadOgFonts(
    `${title}${hook}${story.author ?? ""}…·`,
    `${eyebrow} AFTER 2AM STORIES min read 0123456789·`
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
        fontFamily: "serif",
        padding: "90px",
      }}
    >
      <OgBackdrop accent={accent} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
          maxWidth: "940px",
          textAlign: "center",
        }}
      >
        {/* Hook is the sole hero, set off by a thin accent rule. Title and
              mood/category are demoted to the footer so nothing competes. */}
        <div
          style={{
            width: "72px",
            height: "2px",
            backgroundColor: accent ?? OG_COLORS.accent,
            opacity: accent ? 0.7 : 0.5,
            display: "flex",
          }}
        />
        <div
          style={{
            fontFamily: "Newsreader",
            fontSize:
              (hook || title).length > 100
                ? "52px"
                : (hook || title).length > 64
                  ? "60px"
                  : "70px",
            fontStyle: "italic",
            color: OG_COLORS.title,
            lineHeight: 1.28,
            maxWidth: "980px",
          }}
        >
          {hook || title}
        </div>
      </div>

      {/* Footer: demoted title + meta (left), wordmark (right) — all faint */}
      <div
        style={{
          position: "absolute",
          bottom: "46px",
          left: "90px",
          right: "90px",
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontSize: "22px",
              color: OG_COLORS.muted,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
              fontFamily: "Nunito Sans",
              fontSize: "15px",
              color: OG_COLORS.faint,
            }}
          >
            {eyebrow && (
              <span
                style={{ textTransform: "uppercase", letterSpacing: "0.22em" }}
              >
                {eyebrow}
              </span>
            )}
            {eyebrow && story.author && <span>·</span>}
            {story.author && <span>{story.author}</span>}
            {(eyebrow || story.author) && story.readTime > 0 && <span>·</span>}
            {story.readTime > 0 && <span>{story.readTime} min read</span>}
          </div>
        </div>
        <div
          style={{
            fontFamily: "Nunito Sans",
            fontSize: "15px",
            color: OG_COLORS.faint,
            textTransform: "uppercase",
            letterSpacing: "0.32em",
          }}
        >
          {BRAND}
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}

/**
 * A tailored listing/section card (stories hub, mood archives): brand eyebrow,
 * a serif italic title as the hero, and an optional uppercase subtitle. Shares
 * the backdrop, palette and fonts with {@link siteOgImage} so every card reads
 * as one family.
 */
export async function pageOgImage({
  title,
  subtitle,
  eyebrow = BRAND,
  accent,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Optional `#rrggbb` accent that tints the backdrop glow and the rule. */
  accent?: string;
}) {
  const fonts = await loadOgFonts(
    title,
    `${eyebrow.toUpperCase()} ${(subtitle ?? "").toUpperCase()} ${DOMAIN.toUpperCase()}`
  );

  const titleSize = title.length > 28 ? 64 : title.length > 18 ? 76 : 88;

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
        padding: "90px",
      }}
    >
      <OgBackdrop accent={accent} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
          textAlign: "center",
          maxWidth: "960px",
        }}
      >
        <div
          style={{
            fontFamily: "Nunito Sans",
            fontSize: "20px",
            color: OG_COLORS.faint,
            textTransform: "uppercase",
            letterSpacing: "0.32em",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: "Newsreader",
            fontStyle: "italic",
            fontSize: `${titleSize}px`,
            color: OG_COLORS.title,
            lineHeight: 1.1,
          }}
        >
          {title}
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
        {subtitle ? (
          <div
            style={{
              fontFamily: "Nunito Sans",
              fontSize: "24px",
              color: OG_COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              lineHeight: 1.4,
              maxWidth: "820px",
            }}
          >
            {subtitle}
          </div>
        ) : null}
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
        }}
      >
        {DOMAIN}
      </div>
    </div>,
    {
      ...OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}

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
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Newsreader",
            fontStyle: "italic",
            fontSize: "84px",
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
        }}
      >
        after2amstories.com
      </div>
    </div>,
    {
      ...OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}
