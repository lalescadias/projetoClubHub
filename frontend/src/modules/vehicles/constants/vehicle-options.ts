import type { VehicleStatus, VehicleType } from "../types/vehicle";

export const vehicleTypeLabels: Record<VehicleType, string> = {
  CAR: "Carro",
  VAN: "Carrinha",
  BUS: "Autocarro",
  MOTORCYCLE: "Mota",
  OTHER: "Outro",
};

export const vehicleStatusLabels: Record<VehicleStatus, string> = {
  ACTIVE: "Ativa",
  MAINTENANCE: "Em manutenção",
  UNAVAILABLE: "Indisponível",
};
