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
   `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`), and the Upstash/OpenRouter keys.
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
