ALTER TABLE "Vehicle"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

ALTER TABLE "VehicleUsage"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "VehicleRevision"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT;

ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VehicleUsage"
ADD CONSTRAINT "VehicleUsage_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VehicleUsage"
ADD CONSTRAINT "VehicleUsage_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VehicleRevision"
ADD CONSTRAINT "VehicleRevision_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VehicleRevision"
ADD CONSTRAINT "VehicleRevision_updatedById_fkey"
FOREIGN KEY ("updatedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Vehicle_createdById_idx" ON "Vehicle"("createdById");
CREATE INDEX "VehicleUsage_createdById_idx" ON "VehicleUsage"("createdById");
CREATE INDEX "VehicleRevision_createdById_idx" ON "VehicleRevision"("createdById");
