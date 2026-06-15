import type { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateVehicleUsageInput,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilters,
  VehicleUsageFilters,
} from "./vehicle.types.js";

function normalizeDates<T extends CreateVehicleInput | UpdateVehicleInput>(data: T) {
  return {
    ...data,
    ...(data.inspectionDate !== undefined && {
      inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : null,
    }),
    ...(data.insuranceDate !== undefined && {
      insuranceDate: data.insuranceDate ? new Date(data.insuranceDate) : null,
    }),
    ...(data.notes !== undefined && { notes: data.notes || null }),
    ...(data.version !== undefined && { version: data.version || null }),
  };
}

function serializeUsage<T extends { fuelAmount: unknown; fuelCost: unknown }>(usage: T) {
  return {
    ...usage,
    fuelAmount: usage.fuelAmount === null ? null : Number(usage.fuelAmount),
    fuelCost: usage.fuelCost === null ? null : Number(usage.fuelCost),
  };
}

export class VehicleService {
  async list(clubId: string, filters: VehicleFilters) {
    const { search, status, page, limit } = filters;
    const where: Prisma.VehicleWhereInput = {
      clubId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { plate: { contains: search, mode: "insensitive" } },
          { make: { contains: search, mode: "insensitive" } },
          { model: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(clubId: string, id: string) {
    const vehicle = await prisma.vehicle.findFirst({ where: { id, clubId } });

    if (!vehicle) {
      throw new AppError("Viatura não encontrada.", 404);
    }

    return vehicle;
  }

  async create(clubId: string, input: CreateVehicleInput) {
    return prisma.vehicle.create({
      data: { ...normalizeDates(input), clubId },
    });
  }

  async update(clubId: string, id: string, input: UpdateVehicleInput) {
    await this.getById(clubId, id);

    return prisma.vehicle.update({
      where: { id },
      data: normalizeDates(input),
    });
  }

  async remove(clubId: string, id: string) {
    await this.getById(clubId, id);
    await prisma.vehicle.delete({ where: { id } });
  }

  async getDashboard(clubId: string) {
    const [total, active, maintenance, unavailable] = await prisma.$transaction([
      prisma.vehicle.count({ where: { clubId } }),
      prisma.vehicle.count({ where: { clubId, status: "ACTIVE" } }),
      prisma.vehicle.count({ where: { clubId, status: "MAINTENANCE" } }),
      prisma.vehicle.count({ where: { clubId, status: "UNAVAILABLE" } }),
    ]);

    return { total, active, maintenance, unavailable };
  }

  async listUsages(
    clubId: string,
    vehicleId: string,
    filters: VehicleUsageFilters,
  ) {
    await this.getById(clubId, vehicleId);
    const { page, limit } = filters;

    const [items, total] = await prisma.$transaction([
      prisma.vehicleUsage.findMany({
        where: { vehicleId, vehicle: { clubId } },
        orderBy: [{ usageDate: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vehicleUsage.count({
        where: { vehicleId, vehicle: { clubId } },
      }),
    ]);

    return {
      data: items.map(serializeUsage),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async createUsage(
    clubId: string,
    vehicleId: string,
    input: CreateVehicleUsageInput,
  ) {
    return prisma.$transaction(async (transaction) => {
      const vehicle = await transaction.vehicle.findFirst({
        where: { id: vehicleId, clubId },
      });

      if (!vehicle) {
        throw new AppError("Viatura não encontrada.", 404);
      }

      if (vehicle.status === "UNAVAILABLE") {
        throw new AppError(
          "Não é possível registar uma utilização numa viatura indisponível.",
          422,
        );
      }

      if (input.startMileage !== vehicle.currentMileage) {
        throw new AppError(
          `A quilometragem inicial deve ser ${vehicle.currentMileage} km.`,
          422,
        );
      }

      if (input.endMileage < input.startMileage) {
        throw new AppError(
          "A quilometragem final não pode ser menor que a inicial.",
          422,
        );
      }

      const updated = await transaction.vehicle.updateMany({
        where: {
          id: vehicleId,
          clubId,
          currentMileage: input.startMileage,
          status: { not: "UNAVAILABLE" },
        },
        data: { currentMileage: input.endMileage },
      });

      if (updated.count !== 1) {
        throw new AppError(
          "A viatura foi alterada por outro utilizador. Atualize os dados e tente novamente.",
          409,
        );
      }

      const usage = await transaction.vehicleUsage.create({
        data: {
          vehicleId,
          usedBy: input.usedBy,
          destination: input.destination,
          usageDate: new Date(input.usageDate),
          startMileage: input.startMileage,
          endMileage: input.endMileage,
          fuelAmount: input.fuelAmount ?? null,
          fuelCost: input.fuelCost ?? null,
          notes: input.notes || null,
        },
      });

      return {
        usage: serializeUsage(usage),
        currentMileage: input.endMileage,
      };
    });
  }

  async removeUsage(clubId: string, vehicleId: string, usageId: string) {
    return prisma.$transaction(async (transaction) => {
      const usage = await transaction.vehicleUsage.findFirst({
        where: { id: usageId, vehicleId, vehicle: { clubId } },
      });

      if (!usage) {
        throw new AppError("Utilização não encontrada.", 404);
      }

      const latestUsage = await transaction.vehicleUsage.findFirst({
        where: { vehicleId, vehicle: { clubId } },
        orderBy: [{ usageDate: "desc" }, { createdAt: "desc" }],
        select: { id: true },
      });

      if (latestUsage?.id !== usage.id) {
        throw new AppError(
          "Só é possível apagar a utilização mais recente da viatura.",
          422,
        );
      }

      const restored = await transaction.vehicle.updateMany({
        where: {
          id: vehicleId,
          clubId,
          currentMileage: usage.endMileage,
        },
        data: { currentMileage: usage.startMileage },
      });

      if (restored.count !== 1) {
        throw new AppError(
          "A quilometragem atual já não corresponde a esta utilização.",
          409,
        );
      }

      await transaction.vehicleUsage.delete({ where: { id: usage.id } });

      return { currentMileage: usage.startMileage };
    });
  }
}

export const vehicleService = new VehicleService();
