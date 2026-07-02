import "server-only";

import { createHmac, randomBytes } from "crypto";

/**
 * Minimal OAuth 1.0a (HMAC-SHA1) request signing for the X (Twitter) API v2.
 *
 * This is the "manual" connection path: instead of the browser OAuth 2.0 flow,
 * an admin pastes the four long-lived credentials X generates in the developer
 * portal (API Key/Secret + Access Token/Secret). Those never expire and need no
 * refresh, so they are the robust fallback when the redirect flow is unusable.
 *
 * The v2 endpoints we call (`GET /2/users/me`, `POST /2/tweets`) accept OAuth
 * 1.0a User Context. For a JSON body the signature base string covers only the
 * OAuth parameters (and any query params) — never the JSON payload itself.
 */
export interface OAuth1Credentials {
  consumerKey: string; // API Key
  consumerSecret: string; // API Secret
  accessToken: string; // Access Token
  accessTokenSecret: string; // Access Token Secret
}

/** RFC 3986 percent-encoding (encodeURIComponent leaves !*'() unescaped). */
function pct(value: string): string {
  return encodeURIComponent(value).replace(
    /[!*'()]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * Build the `Authorization: OAuth …` header for a signed request. `query` holds
 * any URL query parameters (none for our current endpoints); the request body
 * is intentionally excluded so it works for JSON POSTs.
 */
export function buildOAuth1Header(opts: {
  method: string;
  url: string;
  creds: OAuth1Credentials;
  query?: Record<string, string>;
}): string {
  const { method, url, creds, query = {} } = opts;

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  // Signature base string: all params (oauth + query) sorted, encoded, joined.
  const allParams = { ...oauthParams, ...query };
  const paramString = Object.keys(allParams)
    .sort()
    .map((k) => `${pct(k)}=${pct(allParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    pct(url),
    pct(paramString),
  ].join("&");

  const signingKey = `${pct(creds.consumerSecret)}&${pct(creds.accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const headerParams: Record<string, string> = {
    ...oauthParams,
    oauth_signature: signature,
  };
  const header = Object.keys(headerParams)
    .sort()
    .map((k) => `${pct(k)}="${pct(headerParams[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}
