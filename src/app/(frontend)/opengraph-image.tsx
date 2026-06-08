import { ImageResponse } from "next/og";

export const alt = "After 2AM Stories";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
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
          gap: "24px",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: "normal",
            fontStyle: "italic",
            color: "#e2e8f0",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          A2S
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "#94a3b8",
            textAlign: "center",
            fontWeight: 300,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Midnight Whispers & Late Night Confessions
        </div>
      </div>

      {/* Decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: "120px",
          width: "200px",
          height: "1px",
          background:
            "linear-gradient(to right, transparent, #475569, transparent)",
        }}
      />
    </div>,
    {
      ...size,
    }
  );
}
