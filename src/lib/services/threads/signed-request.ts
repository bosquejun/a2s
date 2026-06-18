import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { getAppCredentials } from "./client";

/**
 * Verify and decode a Meta `signed_request` (sent to the deauthorize and data
 * deletion callbacks). The token is `<base64url signature>.<base64url payload>`
 * where the signature is an HMAC-SHA256 of the raw payload string keyed by the
 * app secret. Returns the decoded payload only when the signature checks out,
 * so a forged callback can never trigger a disconnect/deletion.
 *
 * See: https://developers.facebook.com/docs/threads (deauthorize / deletion).
 */
export interface SignedRequestPayload {
  /** The Threads-scoped user id of the account that triggered the callback. */
  user_id?: string;
  [key: string]: unknown;
}

export function parseSignedRequest(
  signedRequest: string | null | undefined
): SignedRequestPayload | null {
  if (!signedRequest || !signedRequest.includes(".")) return null;

  const [encodedSig, payload] = signedRequest.split(".", 2);
  if (!encodedSig || !payload) return null;

  let appSecret: string;
  try {
    appSecret = getAppCredentials().appSecret;
  } catch {
    return null;
  }

  let provided: Buffer;
  try {
    provided = Buffer.from(encodedSig, "base64url");
  } catch {
    return null;
  }

  const expected = createHmac("sha256", appSecret).update(payload).digest();
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as SignedRequestPayload;
  } catch {
    return null;
  }
}
