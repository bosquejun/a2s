-- Facebook/Instagram integration: drafts/versions table columns.
-- The earlier facebook_integration and instagram_integration migrations added
-- the auto-post controls to the "stories" table but not to the "_stories_v"
-- drafts/versions table that Payload writes on every create/update and reads
-- when listing or loading draft versions. Without these columns, publishing a
-- story fails the "_stories_v" insert (the same class of bug the x_versions
-- migration fixed for X), surfacing as a 500 from the ingest endpoint. Add the
-- matching version_ columns so those writes resolve. IF NOT EXISTS keeps this
-- safe on databases where Payload's dev push already added them.

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_facebook" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_facebook_post_id" varchar;

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_instagram_post_id" varchar;
