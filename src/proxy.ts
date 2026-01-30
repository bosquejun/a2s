import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const identityId = req.cookies.get("a2s_anon_id");

  if (!identityId) {
    res.cookies.set("a2s_anon_id", `anon_${nanoid(16)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }

  return res;
}
