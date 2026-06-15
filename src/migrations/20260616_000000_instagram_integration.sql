-- Instagram integration schema.
-- Adds Instagram auto-post controls to stories and the linked Instagram
-- account id to the facebook_connection global. Mirrors exactly what Payload's
-- dev push generates for these fields.
--
-- Stories has drafts enabled, so Payload maintains a `_stories_v` version table
-- with a `version_<field>` column per field and queries it on every read. The
-- version columns must exist or reads fail with
-- "column _stories_v.version_auto_post_to_instagram does not exist".

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "instagram_post_id" varchar;

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_instagram_post_id" varchar;

ALTER TABLE "facebook_connection" ADD COLUMN IF NOT EXISTS "instagram_user_id" varchar;
