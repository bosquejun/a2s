-- Catch-up migration: add the Instagram version columns to the `_stories_v`
-- drafts table.
--
-- The earlier 20260616_000000 migration was applied to environments before it
-- included the `_stories_v` columns, so those columns are missing there even
-- though `stories` already has the Instagram fields. Payload reads the version
-- table on every Story query and fails with
-- "column _stories_v.version_auto_post_to_instagram does not exist".
--
-- This migration runs only where 20260616_000000 was already recorded as
-- applied (the runner tracks by filename). It is idempotent: on a fresh database
-- the updated 20260616_000000 already added these columns, so IF NOT EXISTS
-- makes this a no-op.

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_instagram_post_id" varchar;
