# Facebook auto-post

When a story becomes **published**, the app posts a link to it on a Facebook
Page feed. Facebook scrapes the story's Open Graph card from the link, so the
post shows the title image, headline and description automatically; the post
body is the story title plus its one-line `hook` (falling back to the excerpt).

## How it works

1. **Hook** — `src/payload/hooks/social-publish.ts` runs `afterChange` on the
   `stories` collection (alongside `revalidateStory`). On the publish transition
   it enqueues a durable workflow run via `triggerWorkflow("socialPublish", …)`
   and returns; it never posts inline.
2. **Workflow** — `src/app/(frontend)/api/social/publish/route.ts` is an Upstash
   Workflow (`serve()`) invoked by QStash. Each platform is a `context.run`
   step, so QStash retries it independently with backoff — a transient Facebook
   outage is retried, not lost.
3. **Client** — `src/lib/social/facebook.ts` does the actual
   `POST /{page-id}/feed` Graph API call.

It fires only on the **publish transition** — a `create` that is already
published (e.g. the ingest workflow) or an `update` flipping a draft to
published. Re-saving an already-published story does **not** re-post.

Because posting goes through QStash, the same Upstash credentials the whisper
flow uses are required (`QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`,
`QSTASH_NEXT_SIGNING_KEY`), and `NEXT_PUBLIC_SITE_URL` must point at the
production deploy so QStash can call the workflow endpoint back.

It is gated to the **production deploy** (`VERCEL_ENV === "production"`), so
publishing from a Vercel preview admin or local dev never posts to the real
Page — the same gate the view-count tracking uses, because `.env` points at the
production database.

> Known limitation: unpublishing and then republishing a story will post again.
> Dedup against this would need a stored `facebookPostId` field (a DB migration),
> which we deferred for this first version.

## Configuration

Set both env vars in the production environment (Vercel project settings):

```
FACEBOOK_PAGE_ID=<numeric page id>
FACEBOOK_PAGE_ACCESS_TOKEN=<long-lived page access token>
```

If either is blank the hook is a no-op, so the feature is off by default.

## Getting the credentials

1. Create a Facebook App at <https://developers.facebook.com/> (type: Business).
2. Add the **Facebook Login** and **Pages** products, and request the
   `pages_manage_posts` and `pages_read_engagement` permissions.
3. In the **Graph API Explorer**, select your app and Page, and generate a
   User token with those permissions.
4. Exchange it for a **long-lived Page access token** (long-lived user token →
   `GET /{page-id}?fields=access_token`). Page tokens derived from a long-lived
   user token do not expire as long as the user/app stays valid.
5. Find the **Page ID** under the Page's *About* → *Page transparency*, or via
   `GET /me/accounts` in the Graph API Explorer.

The app must be in **Live** mode (not Development) and have completed App
Review for `pages_manage_posts` before it can post to a Page you don't own.

## Testing

Because posting is production-gated, verify the integration without publishing
real stories by calling `publishStoryToFacebook(...)` from a one-off script
with the env vars set, or by posting once via the Graph API Explorer to confirm
the token and permissions are correct.
