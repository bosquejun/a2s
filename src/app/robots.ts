import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://after2amstories.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/track/", "/write", "/create"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

