-- Facebook integration schema.
-- Adds the auto-post controls to stories and the facebook_connection global
-- table. Mirrors exactly what Payload's dev push generates for these fields.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_facebook" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "facebook_post_id" varchar;

CREATE TABLE IF NOT EXISTS "facebook_connection" (
  "id" serial PRIMARY KEY NOT NULL,
  "connected" boolean DEFAULT false,
  "page_name" varchar,
  "page_id" varchar,
  "user_name" varchar,
  "connected_at" timestamp(3) with time zone,
  "page_access_token" varchar,
  "user_access_token" varchar,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);
