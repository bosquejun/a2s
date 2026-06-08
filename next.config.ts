import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (Next.js 16+) for Partial Prerendering.
  // Requires Payload >= 3.81 for admin-route compatibility.
  cacheComponents: true,
};

export default withPayload(nextConfig);
