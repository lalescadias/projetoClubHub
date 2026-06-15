CREATE TYPE "ClubRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Membership_userId_clubId_key" ON "Membership"("userId", "clubId");
CREATE INDEX "Membership_clubId_isActive_idx" ON "Membership"("clubId", "isActive");

ALTER TABLE "Membership"
ADD CONSTRAINT "Membership_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Membership"
ADD CONSTRAINT "Membership_clubId_fkey"
FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Club" ("id", "name", "slug", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'Atlético Clube', 'atletico-clube', CURRENT_TIMESTAMP);

ALTER TABLE "Vehicle" ADD COLUMN "clubId" TEXT;
UPDATE "Vehicle" SET "clubId" = '00000000-0000-4000-8000-000000000001';
ALTER TABLE "Vehicle" ALTER COLUMN "clubId" SET NOT NULL;

DROP INDEX "Vehicle_plate_key";
DROP INDEX "Vehicle_status_idx";
DROP INDEX "Vehicle_make_model_idx";

CREATE UNIQUE INDEX "Vehicle_clubId_plate_key" ON "Vehicle"("clubId", "plate");
CREATE INDEX "Vehicle_clubId_status_idx" ON "Vehicle"("clubId", "status");
CREATE INDEX "Vehicle_clubId_make_model_idx" ON "Vehicle"("clubId", "make", "model");

ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_clubId_fkey"
FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
