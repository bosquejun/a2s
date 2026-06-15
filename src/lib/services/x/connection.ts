import "server-only";

import type { Payload } from "payload";

import type { XTokens } from "./client";
import { decryptToken, encryptToken } from "./crypto";

/**
 * Read/write helpers for the stored X connection (the `x-connection` global).
 * Tokens are encrypted on the way in and decrypted on the way out, so callers
 * always deal in plaintext while the database only ever holds ciphertext.
 *
 * All access goes through `overrideAccess`/`showHiddenFields` because the token
 * fields are deliberately hidden from the admin UI and the API.
 */
const GLOBAL_SLUG = "x-connection" as const;

export interface StoredConnection {
  connected: boolean;
  username: string | null;
  xUserId: string | null;
  accessToken: string | null; // decrypted
  refreshToken: string | null; // decrypted
  tokenExpiresAt: string | null;
  connectedAt: string | null;
}

function expiresAtFrom(expiresIn: number): string {
  return new Date(Date.now() + expiresIn * 1000).toISOString();
}

export async function getConnection(
  payload: Payload
): Promise<StoredConnection> {
  const global = await payload.findGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  });
  return {
    connected: Boolean(global?.connected),
    username: global?.username ?? null,
    xUserId: global?.xUserId ?? null,
    accessToken: decryptToken(global?.accessToken ?? null),
    refreshToken: decryptToken(global?.refreshToken ?? null),
    tokenExpiresAt: global?.tokenExpiresAt ?? null,
    connectedAt: global?.connectedAt ?? null,
  };
}

export async function saveConnection(
  payload: Payload,
  data: {
    username: string;
    xUserId: string;
    tokens: XTokens;
  }
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: true,
      username: data.username,
      xUserId: data.xUserId,
      accessToken: encryptToken(data.tokens.accessToken),
      refreshToken: data.tokens.refreshToken
        ? encryptToken(data.tokens.refreshToken)
        : null,
      tokenExpiresAt: expiresAtFrom(data.tokens.expiresIn),
      codeVerifier: null,
      connectedAt: new Date().toISOString(),
    },
  });
}

/** Persist a refreshed access/refresh token pair, leaving the profile intact. */
export async function updateTokens(
  payload: Payload,
  tokens: XTokens
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      accessToken: encryptToken(tokens.accessToken),
      refreshToken: tokens.refreshToken
        ? encryptToken(tokens.refreshToken)
        : null,
      tokenExpiresAt: expiresAtFrom(tokens.expiresIn),
    },
  });
}

export async function clearConnection(payload: Payload): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: false,
      username: null,
      xUserId: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      codeVerifier: null,
      connectedAt: null,
    },
  });
}

/**
 * Stage the PKCE code verifier (encrypted) for the in-flight connect attempt so
 * the callback can complete the token exchange. The verifier never leaves the
 * server — only its derived challenge is sent to X.
 */
export async function stageCodeVerifier(
  payload: Payload,
  verifier: string
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: { codeVerifier: encryptToken(verifier) },
  });
}

export async function getStagedCodeVerifier(
  payload: Payload
): Promise<string | null> {
  const global = await payload.findGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  });
  return decryptToken(global?.codeVerifier ?? null);
}
