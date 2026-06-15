import { Router } from "express";
import { ClubRole } from "@prisma/client";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { vehicleController } from "./vehicle.controller.js";
import {
  updateVehicleBodySchema,
  vehicleBodySchema,
  vehicleIdParamsSchema,
  vehicleListQuerySchema,
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
