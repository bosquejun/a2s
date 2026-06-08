import { ImageResponse } from "next/og";
import { getStoryBySlug } from "@/lib/services/stories/get-story";

export const alt = "After 2AM Story";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    // Return default image if story not found
    return new ImageResponse(
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            fontStyle: "italic",
            color: "#e2e8f0",
          }}
        >
          After 2AM Stories
        </div>
      </div>,
      { ...size }
    );
  }

  const title =
    story.title.length > 60
      ? story.title.substring(0, 57) + "..."
      : story.title;
  const excerpt = story.excerpt
    ? story.excerpt.length > 120
      ? story.excerpt.substring(0, 117) + "..."
      : story.excerpt
    : "";

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        position: "relative",
        padding: "80px",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          zIndex: 1,
          maxWidth: "900px",
          textAlign: "center",
        }}
      >
        {/* Category badge */}
        {story.categories.length > 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#818cf8",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 500,
            }}
          >
            {story.categories[0]}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "normal",
            fontStyle: "italic",
            color: "#e2e8f0",
            lineHeight: "1.2",
            textAlign: "center",
          }}
        >
          {title}
        </div>

        {/* Excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              lineHeight: "1.5",
              textAlign: "center",
              maxWidth: "800px",
            }}
          >
            {excerpt}
          </div>
        )}

        {/* Author and read time */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "16px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          {story.author && (
            <span style={{ fontStyle: "italic" }}>{story.author}</span>
          )}
          {story.author && story.readTime > 0 && <span>•</span>}
          {story.readTime > 0 && <span>{story.readTime} min read</span>}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          fontSize: "16px",
          color: "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
        }}
      >
        After 2AM Stories
      </div>
    </div>,
    {
      ...size,
    }
  );
}
