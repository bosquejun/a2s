# Threads (Meta) auto-posting setup

The Threads integration auto-posts published stories to a connected Threads
account using Meta's **free** Threads API (no paid tier, no per-post charge —
production posting is gated only by Meta App Review). It reuses the existing
"human-like" social scheduling: routine-published stories trickle out over the
2–4am (Asia/Manila) window, manual publishes get a small jitter, and each post
leads with the story's hook + an inline link + a few discovery hashtags, well
under the ~250 posts/24h limit.

## 1. Create the Meta app (newer "use case" style)

Your existing Facebook/Instagram app is likely an older app without the
**Use cases** panel, and the Threads use case can't be retrofitted onto it.
Create a new app — it doesn't affect your existing app:

1. <https://developers.facebook.com/apps> → **Create App**.
2. On **"What do you want your app to do?"**, select **"Access the Threads API"**.
3. Add an app name + contact email → create. Any app created today is the newer
   style, so the **Use cases** panel will be present.

## 2. Permissions

Threads use case → **Customize / Permissions** → add exactly:

- `threads_basic` — read the connected profile (required baseline).
- `threads_content_publish` — create and publish posts (needs App Review for
  public posting).

Nothing else is needed (no replies/insights/delete/keyword/location scopes).

## 3. Credentials → env vars

Threads use case → **Settings** → copy the **Threads App ID** and **Threads App
Secret** (these are distinct from your Facebook App ID/Secret, even in the same
app — do **not** reuse the Facebook ones, and do **not** use the top-level App
ID under *App settings → Basic*).

```bash
THREADS_APP_ID=<Threads App ID>
THREADS_APP_SECRET=<Threads App Secret>
```

Set these in `.env` (local) and in the Vercel project (production). The access
token is **not** an env var — the admin "Connect" button fetches a long-lived
(~60-day) token and stores it encrypted in the database; it auto-refreshes.

## 4. Callback URLs (Threads use case → Settings)

Paste these exactly — no trailing slash, `https` for the domain ones. The path
is always appended to `NEXT_PUBLIC_SITE_URL`.

| Field | URL (production: `after2amstories.com`) |
| --- | --- |
| Redirect Callback URLs | `https://after2amstories.com/api/threads/callback` |
| Redirect Callback URLs (local dev) | `http://localhost:3000/api/threads/callback` |
| Uninstall / Deauthorize Callback URL | `https://after2amstories.com/api/threads/deauthorize` |
| Delete / Data Deletion Callback URL | `https://after2amstories.com/api/threads/data-deletion` |

- **callback** completes the OAuth connect.
- **deauthorize** clears the stored connection when a user removes the app.
- **data-deletion** clears the connection and returns Meta's required status
  URL + confirmation code.

Both deauthorize/data-deletion verify Meta's HMAC `signed_request` against the
app secret before acting, so a forged callback can't trigger a disconnect.

## 5. Add yourself as a Threads tester (dev mode)

While the app is in Dev mode, posts only reach tester accounts:

1. Threads use case → **Roles / Threads testers** → add your handle.
2. Threads mobile app → **Settings → Account → Website permissions → Invites** →
   **accept**. (Until accepted, Connect fails with a permissions error.)

## 6. Connect

Deploy (so the callback URLs resolve), then in the Payload admin:

**Settings → Threads Connection → Connect Threads Account** → authorize. The
encrypted token is stored and auto-posting is live.

## 7. Going live

To post to a real audience (not just testers), submit the app for **App Review**
approving `threads_content_publish`. Still free — review is the only gate.

## Per-story controls

Each story has an **Auto-post to Threads** toggle (on by default) and a
**Share to Threads** button in the admin sidebar. The `threadsPostId` field is
set after a successful post and prevents duplicate shares.
