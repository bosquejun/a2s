import { type MigrateDownArgs, type MigrateUpArgs, sql } from "@payloadcms/db-postgres";

/**
 * Adds the Facebook integration schema:
 *  - `stories.auto_post_to_facebook` and `stories.facebook_post_id`
 *  - the `facebook_connection` global table
 *
 * DDL mirrors exactly what Payload's dev push generates for these fields, so
 * production (where push is disabled) matches local development.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stories" ADD COLUMN "auto_post_to_facebook" boolean DEFAULT true;
    ALTER TABLE "stories" ADD COLUMN "facebook_post_id" varchar;

    CREATE TABLE "facebook_connection" (
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
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stories" DROP COLUMN IF EXISTS "auto_post_to_facebook";
    ALTER TABLE "stories" DROP COLUMN IF EXISTS "facebook_post_id";
    DROP TABLE IF EXISTS "facebook_connection";
  `);
}
