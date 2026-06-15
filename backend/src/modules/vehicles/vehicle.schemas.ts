import { VehicleStatus, VehicleType } from "@prisma/client";
import { z } from "zod";

const currentYear = new Date().getFullYear();
const optionalDate = z
  .string()
  .date("A data deve estar no formato AAAA-MM-DD.")
  .nullable()
  .optional();

export const vehicleBodySchema = z.object({
  plate: z
    .string()
    .trim()
    .min(5, "A matrícula deve ter pelo menos 5 caracteres.")
    .max(20)
    .transform((value) => value.toUpperCase()),
  make: z.string().trim().min(2).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1950).max(currentYear + 1),
  mileage: z.coerce.number().int().min(0),
  type: z.nativeEnum(VehicleType),
  status: z.nativeEnum(VehicleStatus),
  inspectionDate: optionalDate,
  insuranceDate: optionalDate,
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateVehicleBodySchema = vehicleBodySchema.partial();

export const vehicleIdParamsSchema = z.object({
  id: z.string().uuid("Identificador de viatura inválido."),
});

export const vehicleListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
