import { ImageResponse } from "next/og";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import {
  loadOgFonts,
  OG_COLORS,
  OG_CONTENT_TYPE,
  OG_SIZE,
  OgBackdrop,
} from "@/lib/og/og-kit";

export const alt = "After 2AM Story";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

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
          <OgBackdrop />
          <div
            style={{
              fontSize: "52px",
              fontStyle: "italic",
              color: OG_COLORS.title,
              zIndex: 1,
            }}
          >
            After 2AM Stories
          </div>
        </div>
      ),
      { ...OG_SIZE }
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

  const fonts = await loadOgFonts(
    `${title}${hook}${story.author ?? ""}…·`,
    `${eyebrow} AFTER 2AM min read 0123456789·`
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
              backgroundColor: OG_COLORS.accent,
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
            zIndex: 1,
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
              color: OG_COLORS.faint,
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
      ...OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}
