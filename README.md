# After 2AM Stories

A quiet, intimate storytelling platform for late-night thoughts, confessions,
and haunting narratives. Built with **Next.js 16** and **Payload CMS 3**
(embedded), with AI-assisted story generation.

## Stack

- **Next.js 16 (App Router)** + React 19 + Tailwind v4 + shadcn/ui
- **Payload CMS 3** embedded in the same app (admin at `/admin`), backed by
  **Postgres** via `@payloadcms/db-postgres`
- **OpenRouter + Vercel AI SDK** for the night-writer / night-editor agents
- **Upstash** Workflow/QStash (async generation) + Redis (rate limiting)
- **Cloudflare R2** (S3-compatible) for media uploads via `@payloadcms/storage-s3`

## Architecture

- The frontend lives under `src/app/(frontend)` and reads content through
  Payload's in-process **Local API** (`src/lib/payload.ts`).
- Payload (admin + REST/GraphQL) lives under `src/app/(payload)`. To avoid
  colliding with the app's `/api/*` routes, Payload's REST/GraphQL are served
  under **`/payload-api`** (configured in `src/payload.config.ts`).
- Collections: `Stories`, `StoryRequests`, `Tags`, `Media`, `Users`, plus a
  `SiteSettings` global. Stories have drafts/versions enabled.
- Content authoring: stories use a Lexical rich-text `content` field. AI output
  (HTML) is converted to Lexical on ingest (`src/lib/content/html-to-lexical.ts`)
  and rendered back to HTML for the reader (`src/lib/content/normalize.ts`).

### Content generation flow

- **Mood generation** (`/api/stories/start` → `generate` workflow): the
  night-writer agent produces a story that is **auto-published**.
- **Reader submissions** (`/write` → `/api/stories/write`): the night-editor
  agent reviews the whisper; approved stories are created as **drafts** for
  human review/publishing in `/admin`.

## Getting started

1. Copy env: `cp .env.example .env` and fill in `DATABASE_URL`,
   `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`), the Upstash/OpenRouter keys,
   and the Cloudflare R2 credentials (`R2_ENDPOINT`, `R2_BUCKET`,
   `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
2. Install: `pnpm install`
3. Dev: `pnpm dev` (uses `--no-server-fast-refresh`, required by Payload on
   Next 16.2+). On first boot Payload runs migrations against your Postgres,
   regenerates `src/payload-types.ts`, and the admin is available at
   `http://localhost:3000/admin` (create your first user there).

> Type generation: types are regenerated automatically on dev startup. To run
> the CLI manually, prefer `pnpm payload generate:types --use-swc`.

## Useful scripts

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm payload` — Payload CLI (migrations, types, etc.)
- `pnpm generate:types` — regenerate `payload-types.ts`
- `pnpm lint` / `pnpm format`

## Security

The app ships with a hardened default posture:

- **Security headers** (`next.config.ts`): baseline headers
  (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in
  production) are sent on every route; the public site additionally gets a
  Content-Security-Policy and `X-Frame-Options: DENY`. The Payload admin
  (`/admin`, `/payload-api`) is excluded from the strict CSP so its own
  inline assets keep working.
- **Story HTML sanitization**: Lexical content is converted to HTML in one
  place (`src/lib/content/normalize.ts`) and always passed through the
  allowlist sanitizer (`src/lib/utils/sanitize-story-html.ts`) on the server,
  so tampered rows or prompt-injected agent output cannot become stored XSS.
- **JSON-LD escaping**: structured data is serialized with
  `src/lib/utils/json-ld.ts`, which escapes `<` so `</script>` sequences in
  content cannot break out of the script tag.
- **Anonymous identity**: `a2s_anon_id` is issued by `src/proxy.ts` as an
  `HttpOnly`, `SameSite=Lax` (and `Secure` in production) cookie and is used
  for submission rate limiting (1/day via Upstash). Cookieless clients fall
  back to per-IP limiting.
- **Generation campaigns are operator-only**: `POST /api/stories/start`
  requires `Authorization: Bearer <secret>` where the secret is
  `STORY_GENERATION_SECRET` (or `CRON_SECRET` for Vercel Cron). Unset means
  the endpoint is disabled.
- **Workflow endpoints** (`/api/stories`, `/api/stories/generate`) are
  protected by Upstash QStash request signing (`QSTASH_CURRENT_SIGNING_KEY` /
  `QSTASH_NEXT_SIGNING_KEY`).
- **Track codes** are unguessable capability tokens (~59 bits of entropy).
- **No third-party media on the public site**: the night ambience is brown
  noise synthesized locally with the Web Audio API, so `media-src` stays
  `'self'`.
