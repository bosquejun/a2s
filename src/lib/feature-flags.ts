/**
 * Build-time feature flags, driven by NEXT_PUBLIC_* env vars so the same flag
 * resolves identically in Server and Client Components (Next inlines these at
 * build time). A flag is ON only when its env var is exactly "true"; anything
 * else — unset, "false", "0", "TRUE" — is OFF.
 */
export function readFlag(value: string | undefined): boolean {
  return value === "true";
}

export const featureFlags = {
  /**
   * Reader story submissions ("whisper") flow: the /write and /track pages,
   * the /api/stories/write + /api/track endpoints, and every entry-point link.
   * Disabled by default; set NEXT_PUBLIC_FEATURE_WHISPER=true to enable.
   */
  whisper: readFlag(process.env.NEXT_PUBLIC_FEATURE_WHISPER),
  /**
   * Posting stories to X (Twitter). Disabled by default because X deprecated
   * free posting (pay-per-use only — every post costs credits), so we keep it
   * off until the developer account is funded. Set
   * NEXT_PUBLIC_FEATURE_X_POSTING=true to re-enable auto-post and manual share.
   */
  xPosting: readFlag(process.env.NEXT_PUBLIC_FEATURE_X_POSTING),
} as const;
