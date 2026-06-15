export const vehicleTypes = ["CAR", "VAN", "BUS", "MOTORCYCLE", "OTHER"] as const;
export const vehicleStatuses = ["ACTIVE", "MAINTENANCE", "UNAVAILABLE"] as const;

export type VehicleType = (typeof vehicleTypes)[number];
export type VehicleStatus = (typeof vehicleStatuses)[number];

export type Vehicle = {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  type: VehicleType;
  status: VehicleStatus;
  inspectionDate: string | null;
  insuranceDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VehiclePayload = {
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

export type VehicleDashboard = {
  total: number;
  active: number;
  maintenance: number;
  unavailable: number;
};

export type VehicleListParams = {
  search?: string;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
};
