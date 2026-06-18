import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  clearConnection,
  getConnection,
} from "@/lib/services/threads/connection";
import { parseSignedRequest } from "@/lib/services/threads/signed-request";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

/**
 * Data deletion request callback. Meta calls this when a user asks for their
 * data to be deleted. The only Threads data we store is the connection (token +
 * profile), so deletion == clearing that connection. We must respond with a
 * status URL and a confirmation code that Meta surfaces to the user.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const signedRequest = form?.get("signed_request");
  const payload = parseSignedRequest(
    typeof signedRequest === "string" ? signedRequest : null
  );
  if (!payload) {
    return NextResponse.json({ error: "Invalid signed_request" }, { status: 400 });
  }

  try {
    const client = await getPayloadClient();
    const connection = await getConnection(client);
    if (
      connection.connected &&
      (!payload.user_id || connection.threadsUserId === payload.user_id)
    ) {
      await clearConnection(client);
    }
  } catch (err) {
    console.error("[threads/data-deletion]", err);
  }

  // A stable, non-reversible code so the user (and Meta) can reference this
  // request without us persisting anything extra.
  const confirmationCode = createHash("sha256")
    .update(`threads-deletion:${payload.user_id ?? "unknown"}`)
    .digest("hex")
    .slice(0, 16);

  return NextResponse.json({
    url: `${siteUrl()}/api/threads/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}

/** Status page Meta links the user to so they can confirm the deletion. */
export function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  return NextResponse.json({
    status: "completed",
    message:
      "Your Threads connection data has been removed from After 2AM Stories.",
    confirmation_code: code,
  });
}
