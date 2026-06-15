import type {
  FuelType,
  Prisma,
  VehicleStatus,
  VehicleType,
} from "@prisma/client";

export type CreateVehicleInput = {
  plate: string;
  make: string;
  model: string;
  version?: string | null;
  year: number;
  currentMileage: number;
  fuelType: FuelType;
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

export type CreateVehicleUsageInput = {
  usedBy: string;
  destination: string;
  usageDate: string;
  startMileage: number;
  endMileage: number;
  fuelAmount?: number | null;
  fuelCost?: number | null;
  notes?: string | null;
};

export type UpdateVehicleUsageInput = CreateVehicleUsageInput;

export type VehicleUsageFilters = {
  page: number;
  limit: number;
};

export type CreateVehicleRevisionInput = {
  revisionDate: string;
  mileage: number;
  description: string;
  servicesPerformed: string;
  workshop?: string | null;
  cost?: number | null;
  nextRevisionDate?: string | null;
  nextRevisionMileage?: number | null;
  notes?: string | null;
};

export type UpdateVehicleRevisionInput = Partial<CreateVehicleRevisionInput>;

export type VehicleRevisionFilters = {
  page: number;
  limit: number;
};
