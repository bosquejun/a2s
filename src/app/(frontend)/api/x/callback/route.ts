import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { exchangeCodeForToken, getMe } from "@/lib/services/x/client";
import {
  getStagedCodeVerifier,
  saveConnection,
} from "@/lib/services/x/connection";
import { verifyState } from "@/lib/services/x/state";

const ADMIN_PATH = "/admin/globals/x-connection";

function redirectAdmin(request: Request, params: Record<string, string>) {
  const url = new URL(ADMIN_PATH, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * OAuth callback. Verifies the CSRF state, exchanges the code (with the staged
 * PKCE verifier) for access/refresh tokens, reads the authorizing profile, and
 * stores the connection.
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
    return redirectAdmin(request, { xError: oauthError });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !verifyState(state)) {
    return redirectAdmin(request, {
      xError: "Invalid or expired authorization. Please try connecting again.",
    });
  }

  const verifier = await getStagedCodeVerifier(payload);
  if (!verifier) {
    return redirectAdmin(request, {
      xError: "Connection session expired. Please reconnect.",
    });
  }

  try {
    const tokens = await exchangeCodeForToken(code, verifier);
    const profile = await getMe(tokens.accessToken);

    await saveConnection(payload, {
      username: profile.username,
      xUserId: profile.id,
      tokens,
    });

    return redirectAdmin(request, { xConnected: profile.username });
  } catch (err) {
    console.error("[x/callback]", err);
    return redirectAdmin(request, {
      xError: "Failed to connect to X. Please try again.",
    });
  }
}
