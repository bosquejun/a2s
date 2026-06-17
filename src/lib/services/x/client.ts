import "server-only";

import { createHash, randomBytes } from "crypto";

import { buildOAuth1Header, type OAuth1Credentials } from "./oauth1";

/**
 * Thin wrappers around the X (Twitter) API v2 used by the browser-based account
 * connection flow. No client-side SDK is used — the connect step is a plain
 * server-side OAuth 2.0 (PKCE) redirect, so there are no client-side CSP
 * concerns. Posting uses the authorizing user's access token (a confidential
 * client, so token requests are authenticated with HTTP Basic).
 */
const AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const API = "https://api.twitter.com/2";

// Scopes needed to read the connected profile and publish tweets on its behalf.
// `offline.access` is required to receive a refresh token for long-lived posting.
export const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
];

export class XApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "XApiError";
    this.status = status;
  }
}

export function getAppCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X_CLIENT_ID and X_CLIENT_SECRET must be set");
  }
  return { clientId, clientSecret };
}

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/x/callback`;
}

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Generate a PKCE verifier/challenge pair (S256) for one connect attempt. */
export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function buildOAuthUrl(state: string, codeChallenge: string): string {
  const { clientId } = getAppCredentials();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    scope: X_SCOPES.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export interface XTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number; // seconds until the access token expires
}

function basicAuthHeader(): string {
  const { clientId, clientSecret } = getAppCredentials();
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

async function tokenRequest(body: URLSearchParams): Promise<XTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: basicAuthHeader(),
    },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new XApiError(
      json?.error_description ??
        json?.error ??
        `Token request failed (${res.status})`,
      res.status
    );
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresIn: Number(json.expires_in ?? 7200),
  };
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<XTokens> {
  const { clientId } = getAppCredentials();
  return tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
      code_verifier: codeVerifier,
      client_id: clientId,
    })
  );
}

/**
 * Exchange a refresh token for a fresh access token. X rotates refresh tokens,
 * so the response's `refreshToken` must be persisted in place of the old one.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<XTokens> {
  const { clientId } = getAppCredentials();
  return tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    })
  );
}

export interface XUser {
  id: string;
  username: string;
  name: string;
}

async function apiGetMe(authHeader: string): Promise<XUser> {
  const res = await fetch(`${API}/users/me`, {
    headers: { authorization: authHeader },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.errors) {
    throw new XApiError(
      json?.errors?.[0]?.message ??
        json?.title ??
        `Failed to load X profile (${res.status})`,
      res.status
    );
  }
  return {
    id: json.data.id,
    username: json.data.username,
    name: json.data.name,
  };
}

async function apiPostTweet(authHeader: string, text: string): Promise<string> {
  const res = await fetch(`${API}/tweets`, {
    method: "POST",
    headers: {
      authorization: authHeader,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.errors) {
    throw new XApiError(
      json?.errors?.[0]?.message ??
        json?.detail ??
        json?.title ??
        "Failed to publish to X",
      res.status
    );
  }
  return json.data.id as string;
}

/** Read the authenticated profile using an OAuth 2.0 bearer access token. */
export async function getMe(accessToken: string): Promise<XUser> {
  return apiGetMe(`Bearer ${accessToken}`);
}

/** Publish a tweet using an OAuth 2.0 bearer access token. */
export async function postTweet(opts: {
  accessToken: string;
  text: string;
}): Promise<string> {
  return apiPostTweet(`Bearer ${opts.accessToken}`, opts.text);
}

/** Read the authenticated profile using OAuth 1.0a credentials. */
export async function getMeOAuth1(creds: OAuth1Credentials): Promise<XUser> {
  const url = `${API}/users/me`;
  return apiGetMe(buildOAuth1Header({ method: "GET", url, creds }));
}

/** Publish a tweet using OAuth 1.0a credentials. */
export async function postTweetOAuth1(opts: {
  creds: OAuth1Credentials;
  text: string;
}): Promise<string> {
  const url = `${API}/tweets`;
  const auth = buildOAuth1Header({ method: "POST", url, creds: opts.creds });
  return apiPostTweet(auth, opts.text);
}
