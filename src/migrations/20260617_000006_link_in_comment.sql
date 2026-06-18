-- Link-in-first-comment social engagement option.
-- Adds the per-story comment-id guards (so a link comment is never posted
-- twice) to both the live "stories" table and the "_stories_v" drafts/versions
-- table Payload writes on every create/update, plus the SiteSettings toggles
-- that enable the behaviour per platform. IF NOT EXISTS keeps this safe on
-- databases where Payload's dev push already added the columns.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "facebook_comment_id" varchar;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "instagram_comment_id" varchar;

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_facebook_comment_id" varchar;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_instagram_comment_id" varchar;

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "link_in_comment_facebook" boolean DEFAULT false;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "link_in_comment_instagram" boolean DEFAULT false;
