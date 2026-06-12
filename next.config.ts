import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects inline bootstrap scripts and next/font inlines styles, so
// 'unsafe-inline' stays; 'unsafe-eval' is dev-only (React Fast Refresh).
// Vercel Analytics loads from the same origin in production and from
// va.vercel-scripts.com in development.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // Enable Cache Components (Next.js 16+) for Partial Prerendering.
  // Requires Payload >= 3.81 for admin-route compatibility.
  cacheComponents: true,
  // Tree-shake large barrel imports so only used icons/exports ship.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      // Baseline security headers on every route, including Payload admin.
      {
        source: "/(.*)",
        headers: baseSecurityHeaders,
      },
      // Strict CSP + clickjacking protection for the public site only; the
      // Payload admin (/admin, /payload-api) manages its own inline assets
      // and would break under this policy.
      {
        source: "/((?!admin|payload-api).*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // Long-lived caching for static public assets.
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
