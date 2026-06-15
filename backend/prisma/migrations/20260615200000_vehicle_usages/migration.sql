CREATE TYPE "FuelType" AS ENUM (
    'GASOLINE',
    'DIESEL',
    'ELECTRIC',
    'HYBRID',
    'LPG',
    'OTHER'
);

ALTER TABLE "Vehicle" RENAME COLUMN "mileage" TO "currentMileage";
ALTER TABLE "Vehicle"
ADD COLUMN "version" VARCHAR(100),
ADD COLUMN "fuelType" "FuelType" NOT NULL DEFAULT 'OTHER';

CREATE TABLE "VehicleUsage" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "usedBy" VARCHAR(120) NOT NULL,
    "destination" VARCHAR(180) NOT NULL,
    "usageDate" DATE NOT NULL,
    "startMileage" INTEGER NOT NULL,
    "endMileage" INTEGER NOT NULL,
    "fuelAmount" DECIMAL(10,2),
    "fuelCost" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VehicleUsage_vehicleId_usageDate_idx"
ON "VehicleUsage"("vehicleId", "usageDate");

ALTER TABLE "VehicleUsage"
ADD CONSTRAINT "VehicleUsage_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
