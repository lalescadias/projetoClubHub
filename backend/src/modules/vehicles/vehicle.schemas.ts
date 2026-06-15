import { FuelType, VehicleStatus, VehicleType } from "@prisma/client";
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
  version: z.string().trim().max(100).nullable().optional(),
  year: z.coerce.number().int().min(1950).max(currentYear + 1),
  currentMileage: z.coerce.number().int().min(0),
  fuelType: z.nativeEnum(FuelType),
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

export const vehicleUsageParamsSchema = vehicleIdParamsSchema.extend({
  usageId: z.string().uuid("Identificador de utilização inválido."),
});

export const vehicleRevisionParamsSchema = vehicleIdParamsSchema.extend({
  revisionId: z.string().uuid("Identificador de revisão inválido."),
});

export const vehicleListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const vehicleUsageBodySchema = z
  .object({
    usedBy: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(180),
    usageDate: z.string().date("A data deve estar no formato AAAA-MM-DD."),
    startMileage: z.coerce.number().int().min(0),
    endMileage: z.coerce.number().int().min(0),
    fuelAmount: z.coerce.number().nonnegative().max(10000).nullable().optional(),
    fuelCost: z.coerce.number().nonnegative().max(1000000).nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((data) => data.endMileage >= data.startMileage, {
    path: ["endMileage"],
    message: "A quilometragem final não pode ser menor que a inicial.",
  });

export const updateVehicleUsageBodySchema = vehicleUsageBodySchema;

export const vehicleUsageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const deleteVehicleUsageBodySchema = z.object({
  confirmation: z.literal("delete", {
    errorMap: () => ({ message: 'Escreva "delete" para confirmar a eliminação.' }),
  }),
});

export const vehicleRevisionBodySchema = z.object({
  revisionDate: z.string().date("A data deve estar no formato AAAA-MM-DD."),
  mileage: z.coerce.number().int().min(0),
  description: z.string().trim().min(2).max(240),
  servicesPerformed: z.string().trim().min(2).max(5000),
  workshop: z.string().trim().max(160).nullable().optional(),
  cost: z.coerce.number().nonnegative().max(10000000).nullable().optional(),
  nextRevisionDate: optionalDate,
  nextRevisionMileage: z.coerce.number().int().min(0).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

export const updateVehicleRevisionBodySchema = vehicleRevisionBodySchema.partial();

export const vehicleRevisionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
