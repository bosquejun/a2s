-- Category taxonomy expansion: add WORKPLACE, DESIRE, SPITE, TIES.
-- The taxonomy in src/lib/content/taxonomy.ts gained four categories, but the
-- Postgres enum(s) backing the stories "categories" select were never altered,
-- so inserting one of the new values fails the "stories_categories" insert and
-- surfaces as a 500 from the ingest endpoint. Add the values to whatever enum
-- types actually back the category value columns (the main "stories_categories"
-- table and the "_stories_v_version_categories" versions table). Resolving the
-- type names dynamically keeps this correct regardless of Payload's exact enum
-- naming, and ADD VALUE IF NOT EXISTS is idempotent / safe to re-run.
DO $$
DECLARE
  enum_type text;
  category text;
  categories text[] := ARRAY['WORKPLACE', 'DESIRE', 'SPITE', 'TIES'];
BEGIN
  FOR enum_type IN
    SELECT DISTINCT udt_name
    FROM information_schema.columns
    WHERE data_type = 'USER-DEFINED'
      AND column_name = 'value'
      AND table_name IN ('stories_categories', '_stories_v_version_categories')
  LOOP
    FOREACH category IN ARRAY categories LOOP
      EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_type, category);
    END LOOP;
  END LOOP;
END
$$;
