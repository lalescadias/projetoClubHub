UPDATE "Membership" SET "role" = 'MEMBER' WHERE "role" = 'MANAGER';

ALTER TYPE "ClubRole" RENAME TO "ClubRole_old";
CREATE TYPE "ClubRole" AS ENUM ('ADMIN', 'MEMBER');
ALTER TABLE "Membership"
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "ClubRole" USING ("role"::text::"ClubRole"),
ALTER COLUMN "role" SET DEFAULT 'MEMBER';
DROP TYPE "ClubRole_old";
