import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest and linked via metadata.manifest in layout.tsx.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "After 2AM Stories",
    short_name: "After 2AM",
    description:
      "A quiet, intimate storytelling platform for late-night thoughts, confessions, and haunting narratives.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#01041c",
    theme_color: "#01041c",
    categories: ["entertainment", "lifestyle", "books"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
