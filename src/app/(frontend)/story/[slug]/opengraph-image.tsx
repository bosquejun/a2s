import { ImageResponse } from "next/og";
import { getStoryBySlug } from "@/lib/services/stories/get-story";

export const alt = "After 2AM Story";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Site palette (oklch tokens converted to hex — Satori can't parse oklch).
const COLORS = {
  base: "#0b0b13", // --background ~oklch(0.155 0.022 285)
  title: "#ECECF1", // --foreground
  hook: "#A6A6B7", // --muted-foreground
  accent: "#8b8cf8", // --primary (indigo/violet)
  faint: "#54546a",
};

/**
 * Load a Google Font, subset to just the glyphs we render (via `&text=`), so
 * the OG image matches the site's fonts cheaply. `axis` is the css2 axis spec
 * (e.g. "ital,wght@1,500" or "wght@500"). Returns null on failure so the image
 * still renders with Satori's default font.
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
          // A real browser UA makes Google return a ttf/otf src (Satori-compatible).
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

/** Shared dark, violet-tinted backdrop with soft glows + edge vignette. */
function Backdrop() {
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.base,
        backgroundImage:
          "radial-gradient(900px circle at 18% 22%, rgba(99,102,241,0.20) 0%, transparent 55%)," +
          "radial-gradient(900px circle at 85% 88%, rgba(139,92,246,0.16) 0%, transparent 55%)," +
          "radial-gradient(1200px circle at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)",
        display: "flex",
      }}
    />
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  // Default card (story not found): just the wordmark on the site backdrop.
  if (!story) {
    return new ImageResponse(
      (
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
          <Backdrop />
          <div
            style={{
              fontSize: "52px",
              fontStyle: "italic",
              color: COLORS.title,
              zIndex: 1,
            }}
          >
            After 2AM Stories
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const title =
    story.title.length > 64
      ? story.title.substring(0, 61) + "…"
      : story.title;
  // Prefer the dedicated social hook; fall back to the excerpt.
  const rawHook = story.hook || story.excerpt || "";
  const hook =
    rawHook.length > 140 ? rawHook.substring(0, 137) + "…" : rawHook;
  const eyebrow = [story.mood, story.categories[0]]
    .filter(Boolean)
    .join("  ·  ");

  const serifText = `${title}${hook}${story.author ?? ""}…·`;
  const sansText = `${eyebrow} AFTER 2AM min read 0123456789·`;
  const [serifFont, sansFont] = await Promise.all([
    loadGoogleFont("Newsreader", "ital,wght@1,500", serifText),
    loadGoogleFont("Nunito Sans", "wght@500", sansText),
  ]);
  const fonts = [
    serifFont && {
      name: "Newsreader",
      data: serifFont,
      style: "italic" as const,
      weight: 500 as const,
    },
    sansFont && {
      name: "Nunito Sans",
      data: sansFont,
      style: "normal" as const,
      weight: 500 as const,
    },
  ].filter(Boolean) as {
    name: string;
    data: ArrayBuffer;
    style: "italic" | "normal";
    weight: 500;
  }[];

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
        <Backdrop />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            zIndex: 1,
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
              backgroundColor: COLORS.accent,
              opacity: 0.5,
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
              color: COLORS.title,
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
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontFamily: "Newsreader",
                fontStyle: "italic",
                fontSize: "22px",
                color: COLORS.hook,
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
                color: COLORS.faint,
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
              {(eyebrow || story.author) && story.readTime > 0 && (
                <span>·</span>
              )}
              {story.readTime > 0 && <span>{story.readTime} min read</span>}
            </div>
          </div>
          <div
            style={{
              fontFamily: "Nunito Sans",
              fontSize: "15px",
              color: COLORS.faint,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
            }}
          >
            After 2AM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}
