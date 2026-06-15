import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { clearConnection } from "@/lib/services/x/connection";

/** Clears the stored X connection. Admin-only. */
export async function POST(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearConnection(payload);
  return NextResponse.json({ ok: true });
}
