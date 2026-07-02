import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  listManagedPages,
} from "@/lib/services/facebook/client";
import {
  saveConnection,
  stageUserToken,
} from "@/lib/services/facebook/connection";
import { verifyState } from "@/lib/services/facebook/state";

const ADMIN_PATH = "/admin/globals/facebook-connection";

function emailOf(user: unknown): string {
  return user && typeof user === "object" && "email" in user
    ? String((user as { email?: string }).email ?? "")
    : "";
}

function redirectAdmin(request: Request, params: Record<string, string>) {
  const url = new URL(ADMIN_PATH, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * OAuth callback. Exchanges the code for a long-lived user token, lists the
 * user's Pages, and either connects the single Page directly or hands off to the
 * selection step when the account manages more than one.
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
    return redirectAdmin(request, { fbError: oauthError });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !verifyState(state)) {
    return redirectAdmin(request, {
      fbError: "Invalid or expired authorization. Please try connecting again.",
    });
  }

  try {
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived);
    const pages = await listManagedPages(longLived);

    if (pages.length === 0) {
      return redirectAdmin(request, {
        fbError: "No Facebook Pages found for this account.",
      });
    }

    if (pages.length === 1) {
      const page = pages[0];
      await saveConnection(payload, {
        pageId: page.id,
        pageName: page.name,
        userName: emailOf(user),
        pageAccessToken: page.access_token,
      });
      return redirectAdmin(request, { fbConnected: page.name });
    }

    // Multiple Pages: stage the user token and let the operator choose.
    await stageUserToken(payload, longLived);
    return NextResponse.redirect(new URL("/api/facebook/select", request.url));
  } catch (err) {
    console.error("[facebook/callback]", err);
    return redirectAdmin(request, {
      fbError: "Failed to connect to Facebook. Please try again.",
    });
  }
}
