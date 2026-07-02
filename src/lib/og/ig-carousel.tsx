import { ImageResponse } from "next/og";

import { CATEGORY_ACCENTS } from "@/lib/content/taxonomy";
import { loadOgFonts, OG_COLORS, OgBackdrop } from "@/lib/og/og-kit";
import type { Story } from "@/lib/types";

/**
 * Square (1080×1080) slide renderers for the Instagram carousel — the cover, the
 * paginated body, and the closing call-to-action. All share the backdrop,
 * palette and fonts so the whole carousel reads as one set. (The single-image
 * feed post still uses the landscape OG card via `storyOgImage`.)
 */

export const IG_SQUARE_SIZE = { width: 1080, height: 1080 };

const BRAND = "After 2AM Stories";

/**
 * The opening slide: a square take on the story OG card — the social hook as the
 * hero over a thin accent rule, with a demoted title + meta footer. Unlike the
 * letterboxed OG, this fills the whole 1080² frame.
 */
export async function carouselCoverImage(story: Story) {
  const title =
    story.title.length > 64 ? story.title.substring(0, 61) + "…" : story.title;
  const rawHook = story.hook || story.excerpt || "";
  const hook = rawHook.length > 160 ? rawHook.substring(0, 157) + "…" : rawHook;
  const hero = hook || title;
  const eyebrow = [story.mood, story.categories[0]]
    .filter(Boolean)
    .join("  ·  ");
  const accent = story.categories[0]
    ? CATEGORY_ACCENTS[story.categories[0]]
    : undefined;

  const fonts = await loadOgFonts(
    `${title}${hero}${story.author ?? ""}…·`,
    `${eyebrow} ${BRAND.toUpperCase()} min read 0123456789·`
  );
  const heroSize = hero.length > 110 ? 56 : hero.length > 70 ? 64 : 74;

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
          padding: "96px",
        }}
      >
        <OgBackdrop accent={accent} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "34px",
            maxWidth: "880px",
            textAlign: "center",
          }}
        >
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
              display: "flex",
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontSize: `${heroSize}px`,
              color: OG_COLORS.title,
              lineHeight: 1.3,
            }}
          >
            {hero}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "64px",
            left: "96px",
            right: "96px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            textAlign: "center",
          }}
        >
          {hook && (
            <div
              style={{
                fontFamily: "Newsreader",
                fontStyle: "italic",
                fontSize: "24px",
                color: OG_COLORS.muted,
              }}
            >
              {title}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
              fontFamily: "Nunito Sans",
              fontSize: "16px",
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
            {story.readTime > 0 && <span>{`${story.readTime} min read`}</span>}
          </div>
          <div
            style={{
              fontFamily: "Nunito Sans",
              fontSize: "14px",
              color: OG_COLORS.faint,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
            }}
          >
            {BRAND}
          </div>
        </div>
      </div>
    ),
    {
      ...IG_SQUARE_SIZE,
      ...(fonts.length ? { fonts } : {}),
    }
  );
}

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
  const fontSize = text.length > 180 ? 50 : text.length > 100 ? 60 : 70;

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
export async function carouselCtaImage({
  accent,
  linkInComment,
}: { accent?: string; linkInComment?: boolean } = {}) {
  const headline = "Read the full story";
  const sub = linkInComment ? "Link in comments" : "Link in bio";
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
