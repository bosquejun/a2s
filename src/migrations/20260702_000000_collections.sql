-- Curated story collections ("collections" Payload collection with drafts).
-- Mirrors exactly what Payload's dev push generates for
-- src/payload/collections/Collections.ts plus the seo plugin's meta group:
-- the main table, the ordered stories relationship table, the drafts/versions
-- tables, and the locked-documents bookkeeping column. IF NOT EXISTS and the
-- duplicate_object guards keep this safe on databases where Payload's dev
-- push already added any of it.

DO $$ BEGIN
  CREATE TYPE "enum_collections_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "enum__collections_v_version_status" AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "collections" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar,
  "slug" varchar,
  "hook" varchar,
  "intro" jsonb,
  "published_at" timestamp(3) with time zone,
  "meta_title" varchar,
  "meta_description" varchar,
  "meta_image_id" integer,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "_status" "enum_collections_status" DEFAULT 'draft'
);

CREATE UNIQUE INDEX IF NOT EXISTS "collections_slug_idx" ON "collections" ("slug");
CREATE INDEX IF NOT EXISTS "collections_meta_meta_image_idx" ON "collections" ("meta_image_id");
CREATE INDEX IF NOT EXISTS "collections_updated_at_idx" ON "collections" ("updated_at");
CREATE INDEX IF NOT EXISTS "collections_created_at_idx" ON "collections" ("created_at");
CREATE INDEX IF NOT EXISTS "collections__status_idx" ON "collections" ("_status");

DO $$ BEGIN
  ALTER TABLE "collections" ADD CONSTRAINT "collections_meta_image_id_media_id_fk"
    FOREIGN KEY ("meta_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "collections_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "stories_id" integer
);

CREATE INDEX IF NOT EXISTS "collections_rels_order_idx" ON "collections_rels" ("order");
CREATE INDEX IF NOT EXISTS "collections_rels_parent_idx" ON "collections_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "collections_rels_path_idx" ON "collections_rels" ("path");
CREATE INDEX IF NOT EXISTS "collections_rels_stories_id_idx" ON "collections_rels" ("stories_id");

DO $$ BEGIN
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_stories_fk"
    FOREIGN KEY ("stories_id") REFERENCES "stories"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "_collections_v" (
  "id" serial PRIMARY KEY NOT NULL,
  "parent_id" integer,
  "version_title" varchar,
  "version_slug" varchar,
  "version_hook" varchar,
  "version_intro" jsonb,
  "version_published_at" timestamp(3) with time zone,
  "version_meta_title" varchar,
  "version_meta_description" varchar,
  "version_meta_image_id" integer,
  "version_updated_at" timestamp(3) with time zone,
  "version_created_at" timestamp(3) with time zone,
  "version__status" "enum__collections_v_version_status" DEFAULT 'draft',
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest" boolean
);

CREATE INDEX IF NOT EXISTS "_collections_v_parent_idx" ON "_collections_v" ("parent_id");
CREATE INDEX IF NOT EXISTS "_collections_v_version_version_slug_idx" ON "_collections_v" ("version_slug");
CREATE INDEX IF NOT EXISTS "_collections_v_version_meta_version_meta_image_idx" ON "_collections_v" ("version_meta_image_id");
CREATE INDEX IF NOT EXISTS "_collections_v_version_version_updated_at_idx" ON "_collections_v" ("version_updated_at");
CREATE INDEX IF NOT EXISTS "_collections_v_version_version_created_at_idx" ON "_collections_v" ("version_created_at");
CREATE INDEX IF NOT EXISTS "_collections_v_version_version__status_idx" ON "_collections_v" ("version__status");
CREATE INDEX IF NOT EXISTS "_collections_v_created_at_idx" ON "_collections_v" ("created_at");
CREATE INDEX IF NOT EXISTS "_collections_v_updated_at_idx" ON "_collections_v" ("updated_at");
CREATE INDEX IF NOT EXISTS "_collections_v_latest_idx" ON "_collections_v" ("latest");

DO $$ BEGIN
  ALTER TABLE "_collections_v" ADD CONSTRAINT "_collections_v_parent_id_collections_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "collections"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_collections_v" ADD CONSTRAINT "_collections_v_version_meta_image_id_media_id_fk"
    FOREIGN KEY ("version_meta_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "_collections_v_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" integer NOT NULL,
  "path" varchar NOT NULL,
  "stories_id" integer
);

CREATE INDEX IF NOT EXISTS "_collections_v_rels_order_idx" ON "_collections_v_rels" ("order");
CREATE INDEX IF NOT EXISTS "_collections_v_rels_parent_idx" ON "_collections_v_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "_collections_v_rels_path_idx" ON "_collections_v_rels" ("path");
CREATE INDEX IF NOT EXISTS "_collections_v_rels_stories_id_idx" ON "_collections_v_rels" ("stories_id");

DO $$ BEGIN
  ALTER TABLE "_collections_v_rels" ADD CONSTRAINT "_collections_v_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "_collections_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_collections_v_rels" ADD CONSTRAINT "_collections_v_rels_stories_fk"
    FOREIGN KEY ("stories_id") REFERENCES "stories"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payload tracks admin document locks per collection.
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "collections_id" integer;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_collections_id_idx"
  ON "payload_locked_documents_rels" ("collections_id");

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk"
    FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
