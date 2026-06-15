import type { RequestHandler } from "express";
import type {
  CreateVehicleRevisionInput,
  CreateVehicleUsageInput,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilters,
  VehicleUsageFilters,
  UpdateVehicleRevisionInput,
  UpdateVehicleUsageInput,
  VehicleRevisionFilters,
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
      request.auth!.userId,
      request.body as CreateVehicleInput,
    );
    response.status(201).json({ data: vehicle });
  };

  update: RequestHandler = async (request, response) => {
    const vehicle = await vehicleService.update(
      request.auth!.clubId!,
      request.params.id as string,
      request.auth!.userId,
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

  listUsages: RequestHandler = async (request, response) => {
    const result = await vehicleService.listUsages(
      request.auth!.clubId!,
      request.params.id as string,
      request.query as unknown as VehicleUsageFilters,
    );
    response.json(result);
  };

  createUsage: RequestHandler = async (request, response) => {
    const result = await vehicleService.createUsage(
      request.auth!.clubId!,
      request.params.id as string,
      request.auth!.userId,
      request.body as CreateVehicleUsageInput,
    );
    response.status(201).json({ data: result });
  };

  updateUsage: RequestHandler = async (request, response) => {
    const result = await vehicleService.updateUsage(
      request.auth!.clubId!,
      request.params.id as string,
      request.params.usageId as string,
      request.auth!.userId,
      request.body as UpdateVehicleUsageInput,
    );
    response.json({ data: result });
  };

  removeUsage: RequestHandler = async (request, response) => {
    const result = await vehicleService.removeUsage(
      request.auth!.clubId!,
      request.params.id as string,
      request.params.usageId as string,
      request.auth!.userId,
    );
    response.json({ data: result });
  };

  listRevisions: RequestHandler = async (request, response) => {
    const result = await vehicleService.listRevisions(
      request.auth!.clubId!,
      request.params.id as string,
      request.query as unknown as VehicleRevisionFilters,
    );
    response.json(result);
  };

  getRevision: RequestHandler = async (request, response) => {
    const revision = await vehicleService.getRevision(
      request.auth!.clubId!,
      request.params.id as string,
      request.params.revisionId as string,
    );
    response.json({ data: revision });
  };

  createRevision: RequestHandler = async (request, response) => {
    const revision = await vehicleService.createRevision(
      request.auth!.clubId!,
      request.params.id as string,
      request.auth!.userId,
      request.body as CreateVehicleRevisionInput,
    );
    response.status(201).json({ data: revision });
  };

  updateRevision: RequestHandler = async (request, response) => {
    const revision = await vehicleService.updateRevision(
      request.auth!.clubId!,
      request.params.id as string,
      request.params.revisionId as string,
      request.auth!.userId,
      request.body as UpdateVehicleRevisionInput,
    );
    response.json({ data: revision });
  };

  removeRevision: RequestHandler = async (request, response) => {
    await vehicleService.removeRevision(
      request.auth!.clubId!,
      request.params.id as string,
      request.params.revisionId as string,
    );
    response.status(204).send();
  };
}

export const vehicleController = new VehicleController();
