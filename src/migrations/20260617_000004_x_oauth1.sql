-- Manual OAuth 1.0a connection path for X (Twitter).
-- Adds the auth-method discriminator and the long-lived OAuth 1.0a credential
-- columns (encrypted at rest) to the x_connection global table.

ALTER TABLE "x_connection" ADD COLUMN IF NOT EXISTS "auth_method" varchar DEFAULT 'oauth2';
ALTER TABLE "x_connection" ADD COLUMN IF NOT EXISTS "consumer_key" varchar;
ALTER TABLE "x_connection" ADD COLUMN IF NOT EXISTS "consumer_secret" varchar;
ALTER TABLE "x_connection" ADD COLUMN IF NOT EXISTS "access_token_secret" varchar;
