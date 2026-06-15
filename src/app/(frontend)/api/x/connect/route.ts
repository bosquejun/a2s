import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { buildOAuthUrl, generatePkce } from "@/lib/services/x/client";
import { stageCodeVerifier } from "@/lib/services/x/connection";
import { createState } from "@/lib/services/x/state";

const ADMIN_PATH = "/admin/globals/x-connection";

/**
 * Kicks off the browser OAuth flow: verifies the caller is a signed-in admin,
 * stages a PKCE verifier, then redirects to X's login/consent dialog with a
 * signed CSRF state and the derived code challenge.
 */
export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { verifier, challenge } = generatePkce();
    await stageCodeVerifier(payload, verifier);
    return NextResponse.redirect(buildOAuthUrl(createState(), challenge));
  } catch (error) {
    console.error("[x/connect]", error);
    const url = new URL(ADMIN_PATH, request.url);
    url.searchParams.set(
      "xError",
      "X is not configured. Set X_CLIENT_ID and X_CLIENT_SECRET."
    );
    return NextResponse.redirect(url);
  }
}
