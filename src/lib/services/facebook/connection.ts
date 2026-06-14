import "server-only";

import type { Payload } from "payload";

import { decryptToken, encryptToken } from "./crypto";

/**
 * Read/write helpers for the stored Facebook connection (the `facebook-connection`
 * global). Tokens are encrypted on the way in and decrypted on the way out, so
 * callers always deal in plaintext while the database only ever holds ciphertext.
 *
 * All access goes through `overrideAccess`/`showHiddenFields` because the token
 * fields are deliberately hidden from the admin UI and the API.
 */
const GLOBAL_SLUG = "facebook-connection" as const;

export interface StoredConnection {
  connected: boolean;
  pageId: string | null;
  pageName: string | null;
  userName: string | null;
  pageAccessToken: string | null; // decrypted
  connectedAt: string | null;
}

export async function getConnection(payload: Payload): Promise<StoredConnection> {
  const global = await payload.findGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  });
  return {
    connected: Boolean(global?.connected),
    pageId: global?.pageId ?? null,
    pageName: global?.pageName ?? null,
    userName: global?.userName ?? null,
    pageAccessToken: decryptToken(global?.pageAccessToken ?? null),
    connectedAt: global?.connectedAt ?? null,
  };
}

export async function saveConnection(
  payload: Payload,
  data: {
    pageId: string;
    pageName: string;
    userName?: string | null;
    pageAccessToken: string;
  }
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: true,
      pageId: data.pageId,
      pageName: data.pageName,
      userName: data.userName ?? null,
      pageAccessToken: encryptToken(data.pageAccessToken),
      userAccessToken: null,
      connectedAt: new Date().toISOString(),
    },
  });
}

export async function clearConnection(payload: Payload): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: false,
      pageId: null,
      pageName: null,
      userName: null,
      pageAccessToken: null,
      userAccessToken: null,
      connectedAt: null,
    },
  });
}

/**
 * When a user manages more than one Page we stage the long-lived *user* token
 * (encrypted) so the selection step can re-list their Pages without consuming
 * the single-use OAuth code a second time.
 */
export async function stageUserToken(
  payload: Payload,
  token: string
): Promise<void> {
  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: { userAccessToken: encryptToken(token) },
  });
}

export async function getStagedUserToken(
  payload: Payload
): Promise<string | null> {
  const global = await payload.findGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  });
  return decryptToken(global?.userAccessToken ?? null);
}
