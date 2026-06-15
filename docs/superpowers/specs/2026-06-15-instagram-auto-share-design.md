# Instagram auto-share — design

**Date:** 2026-06-15
**Status:** Approved (pending spec review)

## Goal

When a story is published, auto-share it to the connected Instagram business
account — mirroring the existing Facebook Page auto-share. Also expose a manual
"Share to Instagram" button in the admin, mirroring the Facebook share button.

## Why this is not a copy of the Facebook flow

Instagram's Graph API content-publishing has constraints Facebook's feed does
not:

1. **Every post requires media.** No text-only posts. Story content is text, so
   we must publish an *image*. We reuse the story's existing OG image *design*.
2. **Captions cannot contain clickable links.** Instagram strips URLs from feed
   captions. The story URL cannot be tappable (only the bio link or Story
   stickers are). So the caption points readers to the bio.
3. **Feed images must be JPEG.** The OG route emits PNG via `next/og`
   (`ImageResponse` only outputs PNG), so the image must be converted.
4. **Auth is account-derived, not a separate login.** An Instagram business
   account is linked to a Facebook Page, so we reuse the existing Facebook Page
   connection and discover the Instagram account from it.

## Decisions

| Question | Decision |
|----------|----------|
| Post format | Feed image, reusing the OG design |
| Image size/format | 1080×1080 square JPEG |
| Trigger | Mirror Facebook: auto-post on publish **and** manual button |
| Auth | Reuse the Facebook Page connection; add Instagram scopes |

## Authentication

Instagram publishing uses the **same Page access token** already stored for
Facebook. We extend the existing OAuth flow rather than building a new one.

- Add scopes to `FACEBOOK_SCOPES` in `src/lib/services/facebook/client.ts`:
  `instagram_basic`, `instagram_content_publish`.
- On connect (callback / page-select), discover the Instagram account:
  `GET /{pageId}?fields=instagram_business_account&access_token=PAGE_TOKEN`
  → `instagram_business_account.id`.
- Store that id as `instagramUserId` on the existing `facebook-connection`
  global. If the Page has no linked Instagram business account, the field is
  `null` and Instagram sharing surfaces a clear "no Instagram account linked"
  error.

⚠️ **The existing connection must be reconnected** to grant the new scopes —
old tokens were issued without them.

## Image generation — `/story/[slug]/ig` (JPEG)

New route `src/app/(frontend)/story/[slug]/ig/route.tsx`:

1. Render the existing OG design (reuse `storyOgImage` / `og-kit`) to a PNG
   buffer.
2. Pipe through `sharp` (already a dependency, v0.34.5): fit onto a 1080×1080
   canvas, output `image/jpeg` (quality ~90).
3. Return the JPEG with `Content-Type: image/jpeg`.

The image URL must be publicly reachable by Meta's servers, so this works in
production (`NEXT_PUBLIC_SITE_URL`). On localhost the image is not reachable, so
auto-post will fail there — expected; localhost is not a publishing target.

## Publish flow (Graph API v21)

`src/lib/services/instagram/client.ts` — graph helpers:

1. `getInstagramUserId(pageId, pageToken)` — fetch / confirm the linked IG id.
2. `createMediaContainer({ igUserId, pageToken, imageUrl, caption })` →
   `POST /{ig-user-id}/media` → returns `creation_id`.
3. `publishMedia({ igUserId, pageToken, creationId })` →
   `POST /{ig-user-id}/media_publish` → returns the published media id.

`src/lib/services/instagram/share-story.ts` —
`shareStoryToInstagram(payload, storyId)`, mirroring `shareStory`:

- Guard: if `story.instagramPostId` is set, return `{ alreadyShared: true }`.
- Load connection; require `connected`, `pageAccessToken`, and `instagramUserId`.
- Build the image URL (`/story/{slug}/ig`) and caption.
- Create container → publish → store the media id as `instagramPostId`
  (with `context: { skipInstagramAutoPost: true }` to avoid re-triggering the
  hook).
- On Graph error 190 (revoked/expired token), clear the connection.

### Caption

```
{hook || excerpt || title}

Read the full story — link in bio 🔗
```

No clickable link (Instagram strips it). No auto hashtags in v1.

## Admin / collection changes

`src/payload/collections/Stories.ts` — add sidebar fields mirroring Facebook:

- `autoPostToInstagram` — checkbox, `defaultValue: true`.
- `instagramPostId` — text, read-only, set after posting.
- `shareToInstagram` — `ui` field rendering `InstagramShareButton`.

`src/payload/hooks/publish-to-instagram.ts` — `afterChange` hook mirroring
`publishToFacebook`: fire-and-forget on the published transition when
`autoPostToInstagram` is set and `instagramPostId` is empty; failures are logged,
never block the save. Added to the `Stories` `afterChange` array.

`src/payload/globals/FacebookConnection.ts` + `connection.ts` `StoredConnection`
— add read-only `instagramUserId` field (and optionally `instagramUsername` for
display), populated during connect.

`src/components/admin/InstagramShareButton.tsx` — mirrors
`FacebookShareButton`, POSTs to the manual share route.

`src/app/(frontend)/api/instagram/share/route.ts` — admin-only manual share,
mirroring `api/facebook/share/route.ts`.

## Database migration

Add a migration for the new fields (`stories.autoPostToInstagram`,
`stories.instagramPostId`, `facebook-connection.instagramUserId`). Migrations run
through the loader-independent runner already used by the project.

## Error handling

- No Instagram account linked → clear error from `shareStoryToInstagram`; manual
  route returns 400 with the message; auto-post logs and no-ops.
- Graph error 190 → clear the stored connection (same as Facebook), prompting
  reconnect.
- Image not publicly reachable (e.g., localhost) → Graph container creation
  fails; logged, save not blocked.
- Already shared (`instagramPostId` set) → short-circuit, no duplicate post.

## Risks / operational notes

- **Meta App Review:** `instagram_content_publish` requires App Review for
  production use (same situation as `pages_manage_posts`).
- **Account requirement:** the Instagram account must be Business or Creator and
  linked to the connected Page.
- **Rate limit:** 25 published posts per IG account per 24 hours.

## Testing

Mirror existing test patterns (`vitest`):

- Caption builder — `hook`/`excerpt`/`title` fallback and the link-in-bio suffix.
- Image route — `sharp` output is JPEG and 1080×1080.
- Graph client — mocked `fetch` for container-create and publish, including the
  190 error path.
- `shareStoryToInstagram` — `alreadyShared` guard, missing-connection error,
  missing-IG-account error, success stores `instagramPostId`.

## Out of scope (v1)

- Instagram Stories / Reels / carousels.
- Auto hashtags or @mentions.
- A dedicated Instagram-specific image template (we reuse the OG design).
- A separate Instagram OAuth flow independent of the Facebook Page connection.
