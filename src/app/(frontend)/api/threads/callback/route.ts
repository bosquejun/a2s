import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getProfile,
} from "@/lib/services/threads/client";
import { saveConnection } from "@/lib/services/threads/connection";
import { verifyState } from "@/lib/services/threads/state";

const ADMIN_PATH = "/admin/globals/threads-connection";

function redirectAdmin(request: Request, params: Record<string, string>) {
  const url = new URL(ADMIN_PATH, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * OAuth callback. Exchanges the one-time code for a short-lived token, upgrades
 * it to a long-lived (≈60-day) token, reads the profile, and stores the
 * connection. There is no "Pages" selection step — Threads authorizes a single
 * profile directly.
 */
export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const oauthError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    return redirectAdmin(request, { threadsError: oauthError });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !verifyState(state)) {
    return redirectAdmin(request, {
      threadsError:
        "Invalid or expired authorization. Please try connecting again.",
    });
  }

  try {
    // Threads appends `#_` to the returned code; strip it before exchanging.
    const cleanCode = code.split("#")[0];
    const { accessToken: shortLived } = await exchangeCodeForToken(cleanCode);
    const tokens = await exchangeForLongLivedToken(shortLived);
    const profile = await getProfile(tokens.accessToken);

    await saveConnection(payload, {
      username: profile.username,
      threadsUserId: profile.id,
      tokens,
    });
    return redirectAdmin(request, { threadsConnected: profile.username });
  } catch (err) {
    console.error("[threads/callback]", err);
    return redirectAdmin(request, {
      threadsError: "Failed to connect to Threads. Please try again.",
    });
  }
}
