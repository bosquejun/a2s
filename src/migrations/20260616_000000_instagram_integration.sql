-- Instagram integration schema.
-- Adds Instagram auto-post controls to stories and the linked Instagram
-- account id to the facebook_connection global. Mirrors exactly what Payload's
-- dev push generates for these fields.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "instagram_post_id" varchar;

ALTER TABLE "facebook_connection" ADD COLUMN IF NOT EXISTS "instagram_user_id" varchar;
