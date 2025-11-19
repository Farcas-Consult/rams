CREATE TYPE "user_status" AS ENUM ('invited', 'active', 'inactive', 'suspended');
CREATE TYPE "user_role" AS ENUM ('superadmin', 'admin', 'user');

ALTER TABLE "user" ADD COLUMN "username" text;
ALTER TABLE "user" ADD COLUMN "status" user_status NOT NULL DEFAULT 'active';
ALTER TABLE "user" ADD COLUMN "role" user_role NOT NULL DEFAULT 'user';
ALTER TABLE "user" ADD COLUMN "permissions" jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "user" ADD COLUMN "invitedAt" timestamp;
ALTER TABLE "user" ADD COLUMN "invitationToken" text;
ALTER TABLE "user" ADD COLUMN "invitationExpiresAt" timestamp;

WITH base AS (
  SELECT
    id,
    COALESCE(
      NULLIF(
        lower(
          regexp_replace(split_part(email, '@', 1), '[^a-z0-9]+', '.', 'g')
        ),
        ''
      ),
      'user'
    ) AS base_username,
    createdAt
  FROM "user"
),
numbered AS (
  SELECT
    id,
    base_username,
    row_number() OVER (PARTITION BY base_username ORDER BY createdAt, id) AS rn
  FROM base
)
UPDATE "user" AS u
SET "username" = CASE
  WHEN numbered.rn = 1 THEN numbered.base_username
  ELSE numbered.base_username || '-' || numbered.rn::text
END
FROM numbered
WHERE u.id = numbered.id;

UPDATE "user"
SET "permissions" = '[]'::jsonb
WHERE "permissions" IS NULL;

ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "user_username_key" ON "user" ("username");
CREATE UNIQUE INDEX "user_invitation_token_key" ON "user" ("invitationToken");

