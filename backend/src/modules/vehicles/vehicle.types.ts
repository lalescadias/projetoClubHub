import type { Prisma, VehicleStatus, VehicleType } from "@prisma/client";

export type CreateVehicleInput = {
  plate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  type: VehicleType;
  status: VehicleStatus;
  inspectionDate?: string | null;
  insuranceDate?: string | null;
  notes?: string | null;
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export type VehicleFilters = {
  search?: string;
  status?: VehicleStatus;
  page: number;
  limit: number;
};

export type VehicleData = Prisma.VehicleGetPayload<Record<string, never>>;
