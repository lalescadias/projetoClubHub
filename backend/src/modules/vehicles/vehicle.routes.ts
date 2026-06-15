import { Router } from "express";
import { ClubRole } from "@prisma/client";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { vehicleController } from "./vehicle.controller.js";
import {
  deleteVehicleUsageBodySchema,
  updateVehicleBodySchema,
  vehicleBodySchema,
  vehicleIdParamsSchema,
  vehicleListQuerySchema,
  vehicleUsageBodySchema,
  vehicleUsageListQuerySchema,
  vehicleUsageParamsSchema,
  updateVehicleRevisionBodySchema,
  vehicleRevisionBodySchema,
  vehicleRevisionListQuerySchema,
  vehicleRevisionParamsSchema,
} from "./vehicle.schemas.js";

export const vehicleRoutes = Router();

vehicleRoutes.get(
  "/dashboard",
  vehicleController.dashboard,
);
vehicleRoutes.get(
  "/",
  validate({ query: vehicleListQuerySchema }),
  vehicleController.list,
);
vehicleRoutes.get(
  "/:id/usages",
  validate({
    params: vehicleIdParamsSchema,
    query: vehicleUsageListQuerySchema,
  }),
  vehicleController.listUsages,
);
vehicleRoutes.post(
  "/:id/usages",
  authorize(ClubRole.ADMIN),
  validate({
    params: vehicleIdParamsSchema,
    body: vehicleUsageBodySchema,
  }),
  vehicleController.createUsage,
);
vehicleRoutes.delete(
  "/:id/usages/:usageId",
  authorize(ClubRole.ADMIN),
  validate({
    params: vehicleUsageParamsSchema,
    body: deleteVehicleUsageBodySchema,
  }),
  vehicleController.removeUsage,
);
vehicleRoutes.get(
  "/:id/revisions",
  validate({
    params: vehicleIdParamsSchema,
    query: vehicleRevisionListQuerySchema,
  }),
  vehicleController.listRevisions,
);
vehicleRoutes.get(
  "/:id/revisions/:revisionId",
  validate({ params: vehicleRevisionParamsSchema }),
  vehicleController.getRevision,
);
vehicleRoutes.post(
  "/:id/revisions",
  authorize(ClubRole.ADMIN),
  validate({
    params: vehicleIdParamsSchema,
    body: vehicleRevisionBodySchema,
  }),
  vehicleController.createRevision,
);
vehicleRoutes.patch(
  "/:id/revisions/:revisionId",
  authorize(ClubRole.ADMIN),
  validate({
    params: vehicleRevisionParamsSchema,
    body: updateVehicleRevisionBodySchema,
  }),
  vehicleController.updateRevision,
);
vehicleRoutes.delete(
  "/:id/revisions/:revisionId",
  authorize(ClubRole.ADMIN),
  validate({ params: vehicleRevisionParamsSchema }),
  vehicleController.removeRevision,
);
vehicleRoutes.get(
  "/:id",
  validate({ params: vehicleIdParamsSchema }),
  vehicleController.getById,
);
vehicleRoutes.post(
  "/",
  authorize(ClubRole.ADMIN),
  validate({ body: vehicleBodySchema }),
  vehicleController.create,
);
vehicleRoutes.patch(
  "/:id",
  authorize(ClubRole.ADMIN),
  validate({ params: vehicleIdParamsSchema, body: updateVehicleBodySchema }),
  vehicleController.update,
);
vehicleRoutes.delete(
  "/:id",
  authorize(ClubRole.ADMIN),
  validate({ params: vehicleIdParamsSchema }),
  vehicleController.remove,
);
