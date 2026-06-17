import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { getMeOAuth1, XApiError } from "@/lib/services/x/client";
import { saveOAuth1Connection } from "@/lib/services/x/connection";

/**
 * Manual connection fallback: an admin pastes the four long-lived OAuth 1.0a
 * credentials from the X developer portal (API Key/Secret + Access Token/
 * Secret). We verify them by reading the profile, then store the connection.
 * Admin-only.
 */
export async function POST(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    consumerKey?: string;
    consumerSecret?: string;
    accessToken?: string;
    accessTokenSecret?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const consumerKey = body.consumerKey?.trim();
  const consumerSecret = body.consumerSecret?.trim();
  const accessToken = body.accessToken?.trim();
  const accessTokenSecret = body.accessTokenSecret?.trim();

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    return NextResponse.json(
      {
        error:
          "All four keys are required: API Key, API Secret, Access Token, Access Token Secret.",
      },
      { status: 400 }
    );
  }

  const creds = { consumerKey, consumerSecret, accessToken, accessTokenSecret };

  try {
    const profile = await getMeOAuth1(creds);
    await saveOAuth1Connection(payload, {
      username: profile.username,
      xUserId: profile.id,
      creds,
    });
    return NextResponse.json({ ok: true, username: profile.username });
  } catch (err) {
    const message =
      err instanceof XApiError
        ? `X rejected those credentials: ${err.message}`
        : "Failed to verify credentials. Double-check the four keys.";
    console.error("[x/manual]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
