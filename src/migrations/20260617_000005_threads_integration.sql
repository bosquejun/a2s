-- Threads (Meta) integration schema.
-- Adds the auto-post controls to stories (and the "_stories_v" drafts/versions
-- table Payload reads when listing or loading draft versions) and the
-- threads_connection global table. Mirrors exactly what Payload's dev push
-- generates for these fields. IF NOT EXISTS keeps this safe on databases where
-- Payload's dev push already added them.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_threads" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "threads_post_id" varchar;

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_threads" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_threads_post_id" varchar;

CREATE TABLE IF NOT EXISTS "threads_connection" (
  "id" serial PRIMARY KEY NOT NULL,
  "connected" boolean DEFAULT false,
  "username" varchar,
  "threads_user_id" varchar,
  "connected_at" timestamp(3) with time zone,
  "access_token" varchar,
  "token_expires_at" timestamp(3) with time zone,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);
