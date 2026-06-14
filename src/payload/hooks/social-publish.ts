import type { CollectionAfterChangeHook } from "payload";
import { triggerWorkflow } from "@/lib/workflow-client/client";

/**
 * Cross-post a story to social platforms the moment it becomes published.
 *
 * The actual posting runs in a durable Upstash Workflow (`api/social/publish`)
 * so a transient platform outage is retried by QStash rather than lost; this
 * hook only enqueues the run. Enqueueing is awaited (so the QStash message is
 * committed before the request returns, important on serverless) but never
 * fails publishing.
 *
 * Gated to the production deploy: `.env` points at the prod DB, so an editor
 * publishing from a preview admin (or a local dev publish) must not post to the
 * real pages. `VERCEL_ENV` is the precise gate ("production" only — it is
 * "preview" on branch deploys where `NODE_ENV` is still "production").
 */
function isProductionDeploy(): boolean {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  return env === "production";
}

/**
 * True only on the publish transition:
 * - a `create` whose status is already `published` (e.g. the ingest workflow), or
 * - an `update` flipping a non-published status to `published`.
 * Re-saving an already-published story returns false, so edits never re-post.
 * (Unpublishing then republishing would return true again — acceptable for now.)
 */
export function becamePublished(args: {
  status?: string | null;
  previousStatus?: string | null;
  operation: "create" | "update";
}): boolean {
  if (args.status !== "published") return false;
  return args.operation === "create" || args.previousStatus !== "published";
}

export const socialPublish: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  const shouldPost = becamePublished({
    status: doc?._status,
    previousStatus: previousDoc?._status,
    operation,
  });

  if (!shouldPost || !isProductionDeploy()) {
    return doc;
  }

  try {
    await triggerWorkflow(
      "socialPublish",
      {
        title: doc.title,
        slug: doc.slug,
        hook: doc.hook ?? null,
        excerpt: doc.excerpt ?? null,
      },
      { key: "social-publish-workflow", rate: 1, period: "30s", parallelism: 1 }
    );
  } catch (error) {
    // Enqueue failure must never fail publishing — log and move on.
    console.error("Failed to enqueue social-publish workflow", error);
  }

  return doc;
};
