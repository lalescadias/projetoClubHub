import type { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilters,
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
}

export const vehicleService = new VehicleService();
