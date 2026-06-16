import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/payload-api/",
          "/admin",
          "/track/",
          "/write",
          "/create",
          // Serendipity endpoint: a no-store 302 to a random story. Crawling it
          // wastes budget and risks treating the redirect as duplicate content.
          "/mood/*/random",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
