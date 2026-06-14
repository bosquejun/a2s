/**
 * Throwaway smoke test for the Facebook Page integration.
 *
 * It posts a single link to the configured Page using the *same* Graph API call
 * and message format as `src/lib/social/facebook.ts`, but standalone — it does
 * not import that module (which is `server-only`) or go through QStash/the
 * publish hook. Use it to confirm the token + permissions work before relying on
 * the real publish flow.
 *
 * Usage (env vars must be set):
 *   FACEBOOK_PAGE_ID=... FACEBOOK_PAGE_ACCESS_TOKEN=... \
 *     pnpm tsx scripts/test-facebook-post.ts [slug] [title]
 *
 * Defaults to a clearly-labeled test post if no slug/title are given. Delete the
 * post from the Page afterwards.
 */

const GRAPH_API_VERSION = "v21.0";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://after2amstories.com";

function buildMessage(title: string, tagline: string): string {
  return [title.trim(), tagline.trim()].filter(Boolean).join("\n\n");
}

async function main() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    console.error(
      "Missing FACEBOOK_PAGE_ID and/or FACEBOOK_PAGE_ACCESS_TOKEN env vars."
    );
    process.exit(1);
  }

  const slug = process.argv[2] ?? "test-story";
  const title = process.argv[3] ?? "Facebook integration smoke test";
  const tagline =
    process.argv[4] ?? "If you can see this on the Page, the token works.";

  const link = `${SITE_URL}/story/${slug}`;
  const message = buildMessage(title, tagline);

  console.log("Posting to Facebook Page:");
  console.log(`  page id: ${pageId}`);
  console.log(`  link:    ${link}`);
  console.log(`  message: ${JSON.stringify(message)}`);
  console.log("");

  const body = new URLSearchParams({ message, link, access_token: accessToken });

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
    { method: "POST", body }
  );

  const text = await res.text();

  if (!res.ok) {
    console.error(`Graph API error ${res.status} ${res.statusText}:`);
    console.error(text);
    process.exit(1);
  }

  console.log("Success. Response:");
  console.log(text);
  console.log("\nDelete the test post from the Page when you're done.");
}

main().catch((error) => {
  console.error("Unexpected failure:", error);
  process.exit(1);
});
