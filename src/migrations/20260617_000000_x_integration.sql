-- X (Twitter) integration schema.
-- Adds the auto-post controls to stories and the x_connection global table.
-- Mirrors exactly what Payload's dev push generates for these fields.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_x" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "x_post_id" varchar;

CREATE TABLE IF NOT EXISTS "x_connection" (
  "id" serial PRIMARY KEY NOT NULL,
  "connected" boolean DEFAULT false,
  "username" varchar,
  "x_user_id" varchar,
  "connected_at" timestamp(3) with time zone,
  "access_token" varchar,
  "refresh_token" varchar,
  "token_expires_at" timestamp(3) with time zone,
  "code_verifier" varchar,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);
