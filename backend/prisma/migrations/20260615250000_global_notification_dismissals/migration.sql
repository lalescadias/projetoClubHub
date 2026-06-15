ALTER TABLE "NotificationDismissal"
DROP CONSTRAINT "NotificationDismissal_membershipId_fkey";

DROP INDEX "NotificationDismissal_membershipId_notificationId_key";
DROP INDEX "NotificationDismissal_membershipId_idx";

ALTER TABLE "NotificationDismissal"
ADD COLUMN "userId" TEXT,
ADD COLUMN "clubId" TEXT;

UPDATE "NotificationDismissal" AS dismissal
SET
  "userId" = membership."userId",
  "clubId" = membership."clubId"
FROM "Membership" AS membership
WHERE membership."id" = dismissal."membershipId";

ALTER TABLE "NotificationDismissal"
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "clubId" SET NOT NULL,
DROP COLUMN "membershipId";

CREATE UNIQUE INDEX "NotificationDismissal_userId_clubId_notificationId_key"
ON "NotificationDismissal"("userId", "clubId", "notificationId");

CREATE INDEX "NotificationDismissal_userId_clubId_idx"
ON "NotificationDismissal"("userId", "clubId");

ALTER TABLE "NotificationDismissal"
ADD CONSTRAINT "NotificationDismissal_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
