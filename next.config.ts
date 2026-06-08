import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (Next.js 16+) for Partial Prerendering.
  // Requires Payload >= 3.81 for admin-route compatibility.
  cacheComponents: true,
  // Tree-shake large barrel imports so only used icons/exports ship.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Long-lived caching for static public assets.
  async headers() {
    return [
      {
        source: "/:all*(webp|png|jpg|jpeg|svg|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
