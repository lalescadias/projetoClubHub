import type { RequestHandler } from "express";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilters,
} from "./vehicle.types.js";
import { vehicleService } from "./vehicle.service.js";

export class VehicleController {
  list: RequestHandler = async (request, response) => {
    const result = await vehicleService.list(
      request.auth!.clubId!,
      request.query as unknown as VehicleFilters,
    );
    response.json(result);
  };

  getById: RequestHandler = async (request, response) => {
    const vehicle = await vehicleService.getById(
      request.auth!.clubId!,
      request.params.id as string,
    );
    response.json({ data: vehicle });
  };

  create: RequestHandler = async (request, response) => {
    const vehicle = await vehicleService.create(
      request.auth!.clubId!,
      request.body as CreateVehicleInput,
    );
    response.status(201).json({ data: vehicle });
  };

  update: RequestHandler = async (request, response) => {
    const vehicle = await vehicleService.update(
      request.auth!.clubId!,
      request.params.id as string,
      request.body as UpdateVehicleInput,
    );
    response.json({ data: vehicle });
  };

  remove: RequestHandler = async (request, response) => {
    await vehicleService.remove(request.auth!.clubId!, request.params.id as string);
    response.status(204).send();
  };

  dashboard: RequestHandler = async (_request, response) => {
    const dashboard = await vehicleService.getDashboard(_request.auth!.clubId!);
    response.json({ data: dashboard });
  };
}

export const vehicleController = new VehicleController();
