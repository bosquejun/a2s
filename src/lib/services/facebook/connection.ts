import "server-only";

import type { Payload } from "payload";

import { decryptToken, encryptToken } from "./crypto";
import { getInstagramUserId } from "@/lib/services/instagram/client";

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
  instagramUserId: string | null;
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
    instagramUserId: global?.instagramUserId ?? null,
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
  let instagramUserId: string | null = null;
  try {
    instagramUserId = await getInstagramUserId(data.pageId, data.pageAccessToken);
    if (!instagramUserId) {
      payload.logger.warn(
        { pageId: data.pageId },
        "[instagram] no instagram_business_account linked to Page on connect — " +
          "ensure the Instagram account is Business/Creator, linked to this Page, " +
          "and that instagram_basic was granted"
      );
    } else {
      payload.logger.info(
        { pageId: data.pageId, instagramUserId },
        "[instagram] discovered linked Instagram account on connect"
      );
    }
  } catch (err) {
    // Discovery must never break the Facebook connection, but log why it failed
    // so a missing scope / Graph error is debuggable rather than a silent null.
    payload.logger.error(
      { err, pageId: data.pageId },
      "[instagram] failed to discover linked Instagram account on connect"
    );
    instagramUserId = null;
  }

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
      instagramUserId,
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
      instagramUserId: null,
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
