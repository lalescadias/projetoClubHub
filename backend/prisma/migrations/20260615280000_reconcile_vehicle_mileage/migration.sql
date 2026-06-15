UPDATE "Vehicle" AS vehicle
SET "currentMileage" = (
  SELECT usage."endMileage"
  FROM "VehicleUsage" AS usage
  WHERE usage."vehicleId" = vehicle.id
  ORDER BY usage."createdAt" DESC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1
  FROM "VehicleUsage" AS usage
  WHERE usage."vehicleId" = vehicle.id
);
