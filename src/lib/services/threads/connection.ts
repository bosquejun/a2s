import "server-only";

import type { Payload } from "payload";

import type { ThreadsTokens } from "./client";
import { decryptToken, encryptToken } from "./crypto";

/**
 * Read/write helpers for the stored Threads connection (the `threads-connection`
 * global). Tokens are encrypted on the way in and decrypted on the way out, so
 * callers always deal in plaintext while the database only ever holds
 * ciphertext.
 *
 * All access goes through `overrideAccess`/`showHiddenFields` because the token
 * fields are deliberately hidden from the admin UI and the API.
 */
const GLOBAL_SLUG = "threads-connection" as const;

export interface StoredConnection {
  connected: boolean;
  username: string | null;
  threadsUserId: string | null;
  accessToken: string | null; // decrypted (long-lived token)
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
    threadsUserId: global?.threadsUserId ?? null,
    accessToken: decryptToken(global?.accessToken ?? null),
    tokenExpiresAt: global?.tokenExpiresAt ?? null,
    connectedAt: global?.connectedAt ?? null,
  };
}

export async function saveConnection(
  payload: Payload,
  data: {
    username: string;
    threadsUserId: string;
    tokens: ThreadsTokens;
  }
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: true,
      username: data.username,
      threadsUserId: data.threadsUserId,
      accessToken: encryptToken(data.tokens.accessToken),
      tokenExpiresAt: expiresAtFrom(data.tokens.expiresIn),
      connectedAt: new Date().toISOString(),
    },
  });
}

/** Persist a refreshed long-lived token, leaving the profile intact. */
export async function updateTokens(
  payload: Payload,
  tokens: ThreadsTokens
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      accessToken: encryptToken(tokens.accessToken),
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
      threadsUserId: null,
      accessToken: null,
      tokenExpiresAt: null,
      connectedAt: null,
    },
  });
}
