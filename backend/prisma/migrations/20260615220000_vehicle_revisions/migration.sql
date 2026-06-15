CREATE TABLE "VehicleRevision" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "revisionDate" DATE NOT NULL,
    "mileage" INTEGER NOT NULL,
    "description" VARCHAR(240) NOT NULL,
    "servicesPerformed" TEXT NOT NULL,
    "workshop" VARCHAR(160),
    "cost" DECIMAL(12,2),
    "nextRevisionDate" DATE,
    "nextRevisionMileage" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VehicleRevision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VehicleRevision_vehicleId_revisionDate_idx"
ON "VehicleRevision"("vehicleId", "revisionDate");

ALTER TABLE "VehicleRevision"
ADD CONSTRAINT "VehicleRevision_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
