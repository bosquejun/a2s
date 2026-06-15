-- X integration: drafts/versions table columns.
-- The earlier x_integration migration added the auto-post controls to the
-- "stories" table but not to the "_stories_v" drafts/versions table that
-- Payload reads when listing or loading draft versions. Add the matching
-- version_ columns so those queries resolve. IF NOT EXISTS keeps this safe on
-- databases where Payload's dev push already added them.

ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_auto_post_to_x" boolean DEFAULT true;
ALTER TABLE "_stories_v" ADD COLUMN IF NOT EXISTS "version_x_post_id" varchar;
