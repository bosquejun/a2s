import "server-only";

import { FacebookGraphError } from "@/lib/services/facebook/client";

const GRAPH_VERSION = "v21.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

async function graphPost(
  path: string,
  params: Record<string, string>
): Promise<{ id?: string }> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}/${path}`, { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Instagram Graph request failed",
      json?.error?.code
    );
  }
  return json;
}

/**
 * Resolve the Instagram business account linked to a Facebook Page. Returns
 * null when the Page has no linked Instagram business/creator account.
 */
export async function getInstagramUserId(
  pageId: string,
  pageAccessToken: string
): Promise<string | null> {
  const url = new URL(`${GRAPH}/${pageId}`);
  url.searchParams.set("fields", "instagram_business_account");
  url.searchParams.set("access_token", pageAccessToken);
  const res = await fetch(url, { method: "GET" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Failed to read linked Instagram account",
      json?.error?.code
    );
  }
  return json?.instagram_business_account?.id ?? null;
}

/** Step 1 of publishing: stage the image + caption, get a creation id. */
export async function createMediaContainer(opts: {
  igUserId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}

/**
 * Carousel step 1a: stage one image as a carousel child. Returns the child's
 * creation id, which is later passed to {@link createCarouselContainer}.
 */
export async function createCarouselItemContainer(opts: {
  igUserId: string;
  pageAccessToken: string;
  imageUrl: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media`, {
    image_url: opts.imageUrl,
    is_carousel_item: "true",
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}

/**
 * Carousel step 1b: stage the parent carousel from its child creation ids plus
 * the shared caption. Returns the parent creation id to publish.
 */
export async function createCarouselContainer(opts: {
  igUserId: string;
  pageAccessToken: string;
  children: string[];
  caption: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media`, {
    media_type: "CAROUSEL",
    children: opts.children.join(","),
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}

/** Step 2 of publishing: publish a staged creation id, get the media id. */
export async function publishMedia(opts: {
  igUserId: string;
  pageAccessToken: string;
  creationId: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media_publish`, {
    creation_id: opts.creationId,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}

/**
 * Read a media container's processing state. Instagram fetches each `image_url`
 * asynchronously, so a freshly created container reports `IN_PROGRESS` until the
 * image is downloaded and validated; `status_code` then becomes `FINISHED`,
 * `ERROR`, or `EXPIRED`.
 */
export async function getContainerStatus(opts: {
  creationId: string;
  pageAccessToken: string;
}): Promise<string> {
  const url = new URL(`${GRAPH}/${opts.creationId}`);
  url.searchParams.set("fields", "status_code");
  url.searchParams.set("access_token", opts.pageAccessToken);
  const res = await fetch(url, { method: "GET" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Failed to read media container status",
      json?.error?.code
    );
  }
  return (json?.status_code as string) ?? "IN_PROGRESS";
}

/**
 * Poll a media container until it finishes processing. Publishing (or nesting a
 * child into a carousel) before this returns `FINISHED` is what triggers
 * Instagram's "Media ID is not available" error, so callers must await this
 * between creating a container and using it.
 */
export async function waitForMediaContainer(opts: {
  creationId: string;
  pageAccessToken: string;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 2_000;
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const status = await getContainerStatus({
      creationId: opts.creationId,
      pageAccessToken: opts.pageAccessToken,
    });
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      throw new FacebookGraphError(
        `Media container ${opts.creationId} failed to process (status: ${status})`
      );
    }
    if (Date.now() >= deadline) {
      throw new FacebookGraphError(
        `Timed out waiting for media container ${opts.creationId} to finish (status: ${status})`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Add a comment to a published media object. Used for the link-in-first-comment
 * option; note that Instagram does not render links in comments as clickable,
 * so the URL is only copy-pasteable for readers.
 */
export async function commentOnMedia(opts: {
  mediaId: string;
  pageAccessToken: string;
  message: string;
}): Promise<string> {
  const json = await graphPost(`${opts.mediaId}/comments`, {
    message: opts.message,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}
