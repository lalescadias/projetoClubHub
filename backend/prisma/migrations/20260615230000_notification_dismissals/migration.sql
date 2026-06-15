CREATE TABLE "NotificationDismissal" (
    "id" TEXT NOT NULL,
    "notificationId" VARCHAR(240) NOT NULL,
    "membershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDismissal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationDismissal_membershipId_notificationId_key"
ON "NotificationDismissal"("membershipId", "notificationId");

CREATE INDEX "NotificationDismissal_membershipId_idx"
ON "NotificationDismissal"("membershipId");

ALTER TABLE "NotificationDismissal"
ADD CONSTRAINT "NotificationDismissal_membershipId_fkey"
FOREIGN KEY ("membershipId") REFERENCES "Membership"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
