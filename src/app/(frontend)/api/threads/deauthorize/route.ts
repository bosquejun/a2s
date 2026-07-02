import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import {
  clearConnection,
  getConnection,
} from "@/lib/services/threads/connection";
import { parseSignedRequest } from "@/lib/services/threads/signed-request";

/**
 * Deauthorize (uninstall) callback. Meta calls this when a user removes the app
 * from their Threads account. We verify the signed request and drop the stored
 * connection for that account so the app stops trying to post and the admin is
 * prompted to reconnect. Always 200 on a well-formed request — Meta treats a
 * non-2xx as a delivery failure and retries.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const signedRequest = form?.get("signed_request");
  const payload = parseSignedRequest(
    typeof signedRequest === "string" ? signedRequest : null
  );
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid signed_request" },
      { status: 400 }
    );
  }

  try {
    const client = await getPayloadClient();
    const connection = await getConnection(client);
    // Only clear when the callback is for the account we actually hold.
    if (
      connection.connected &&
      (!payload.user_id || connection.threadsUserId === payload.user_id)
    ) {
      await clearConnection(client);
    }
  } catch (err) {
    console.error("[threads/deauthorize]", err);
  }

  return NextResponse.json({ ok: true });
}
