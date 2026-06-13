# Story Generation Routine

This is the prompt for a scheduled `/schedule` Claude routine that authors a
small daily batch of "After 2AM" stories and publishes them to the live site
through the ingest endpoint. Stories must conform exactly to the schema below —
the endpoint rejects anything off-shape.

**Run environment provides:**
- `{SITE}` — production base URL (e.g. `https://after2am.example.com`)
- `STORY_GENERATION_SECRET` — bearer token for the ingest endpoint

---

## What to do each run

1. **Survey recent stories (for variety).**
   `GET {SITE}/payload-api/stories?sort=-publishedAt&limit=20&depth=0`
   Note the recent `mood` and `categories` values and titles.

2. **Choose 3–5 distinct combinations.** Pick mood × category pairs that are
   *not* heavily represented in the recent list. Vary intensity across the batch.
   Avoid repeating recent titles or premises.

3. **Write each story** following the voice rules and output schema below.

4. **Publish each story:**
   `POST {SITE}/api/stories/ingest`
   Headers: `Authorization: Bearer {STORY_GENERATION_SECRET}`, `Content-Type: application/json`
   Body: the JSON object described in **Output schema**.
   - `201` → published (record the returned `slug`)
   - `409` → a story with that slug already exists; skip it
   - `400` → schema/validation error; read the message, fix the body, retry once
   - other → treat as failure, record and continue

5. **Report:** list created slugs and any skipped (409) or failed stories with reasons.

---

## Allowed taxonomy (use these exact values)

**mood** (exactly one): `CANT_SLEEP`, `DARK`, `MISS_SOMEONE`, `EMPTY`, `REFLECTIVE`, `UNSETTLING`

**categories** (1–3 of): `HORROR`, `CONFESSION`, `ROMANCE`, `EXISTENTIAL`, `SURREAL`

**intensity** (1–5):
- 1 = cozy / calming
- 2 = melancholic
- 3 = emotionally heavy but grounded
- 4 = unsettling
- 5 = intense but non-graphic

---

## Voice rules

Write like a real person typing late at night.
- Human, quiet, grounded voice.
- Do NOT invent dramatic events, symbols, or metaphors. Everything ordinary and believable.
- Apply the chosen intensity level.

The STORY:
- First-person perspective.
- Takes place after 2am.
- Ordinary setting (room, phone glow, silence, stillness).
- Feels like a private thought or confession.
- Emotional honesty allowed, but restrained.
- No dramatic twists or clean resolution.
- Length: 120–250 words.

The TITLE:
- Max 6 words. Specific and concrete.
- References a real detail or recurring thought in the story.
- Quiet label, not a headline. No new imagery.

TAGS: 3–5 lowercase tags, directly grounded in the story text. No generic tags.

SEO:
- `seo.title` (≤60 chars): calm, descriptive, specific, based on the situation.
- `seo.description` (120–160 chars): no spoilers, reads like an invitation.
- `seo.keywords`: 1–5 grounded keywords.

---

## Output schema (the POST body)

```json
{
  "title": "string, 1–60 chars",
  "excerpt": "string, 1–160 chars",
  "hook": "string, 1–120 chars — one-line hook for share images",
  "mood": "one of the allowed mood values",
  "categories": ["1–3 of the allowed category values"],
  "tags": ["1–5 lowercase tags"],
  "intensity": 1,
  "author": "string, 1–100 chars (e.g. Anon or a quiet pseudonym)",
  "htmlBody": "<p>HTML-formatted story body</p>",
  "readTime": 1,
  "wordCount": 140,
  "seo": {
    "title": "string, 1–60 chars",
    "description": "string, 1–160 chars",
    "keywords": ["1–5 strings"]
  }
}
```

`htmlBody` is converted to Payload's Lexical format and tags are upserted
server-side, so send plain semantic HTML (`<p>`, `<em>`, etc.). The endpoint
validates this exact shape against the same schema the app uses; consistency is
enforced there.

---

## Notes

- The reader-submission ("whisper") flow is separate and unaffected.
- One story per slug — reruns are safe (duplicates return 409 and are skipped).
- Derived slug = lowercase, hyphenated `title`; keep titles distinct.
