import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { listManagedPages } from "@/lib/services/facebook/client";
import {
  getStagedUserToken,
  saveConnection,
} from "@/lib/services/facebook/connection";

const ADMIN_PATH = "/admin/globals/facebook-connection";

function emailOf(user: unknown): string {
  return user && typeof user === "object" && "email" in user
    ? String((user as { email?: string }).email ?? "")
    : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function adminRedirect(request: Request, params: Record<string, string>) {
  const url = new URL(ADMIN_PATH, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * Page-selection step for accounts that manage multiple Pages. Without a `page`
 * query param it renders a minimal chooser; with one it finalizes the
 * connection using the staged long-lived user token.
 */
export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const userToken = await getStagedUserToken(payload);
  if (!userToken) {
    return adminRedirect(request, {
      fbError: "Connection session expired. Please reconnect.",
    });
  }

  let pages;
  try {
    pages = await listManagedPages(userToken);
  } catch {
    return adminRedirect(request, { fbError: "Failed to load your Pages." });
  }

  const selectedId = new URL(request.url).searchParams.get("page");
  if (selectedId) {
    const page = pages.find((p) => p.id === selectedId);
    if (!page) {
      return adminRedirect(request, { fbError: "Selected Page not found." });
    }
    await saveConnection(payload, {
      pageId: page.id,
      pageName: page.name,
      userName: emailOf(user),
      pageAccessToken: page.access_token,
    });
    return adminRedirect(request, { fbConnected: page.name });
  }

  const items = pages
    .map(
      (p) =>
        `<li><a href="/api/facebook/select?page=${encodeURIComponent(p.id)}">${escapeHtml(p.name)}</a></li>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Select a Facebook Page</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; }
      h1 { font-size: 1.25rem; }
      ul { list-style: none; padding: 0; }
      li { margin: 0.5rem 0; }
      a { display: block; padding: 0.75rem 1rem; border: 1px solid #ccc; border-radius: 0.5rem; text-decoration: none; color: inherit; }
      a:hover { background: #f3f3f3; }
    </style>
  </head>
  <body>
    <h1>Choose a Page to connect</h1>
    <ul>${items}</ul>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
