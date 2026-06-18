import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { buildOAuthUrl } from "@/lib/services/threads/client";
import { createState } from "@/lib/services/threads/state";

const ADMIN_PATH = "/admin/globals/threads-connection";

/**
 * Kicks off the browser OAuth flow: verifies the caller is a signed-in admin,
 * then redirects to the Threads login/consent dialog with a signed CSRF state.
 */
export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    return NextResponse.redirect(buildOAuthUrl(createState()));
  } catch (error) {
    console.error("[threads/connect]", error);
    const url = new URL(ADMIN_PATH, request.url);
    url.searchParams.set(
      "threadsError",
      "Threads is not configured. Set THREADS_APP_ID and THREADS_APP_SECRET."
    );
    return NextResponse.redirect(url);
  }
}
