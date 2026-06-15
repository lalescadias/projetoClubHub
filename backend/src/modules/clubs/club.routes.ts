import { UserRole } from "@prisma/client";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { clubController } from "./club.controller.js";
import {
  clubBodySchema,
  clubParamsSchema,
  deleteClubBodySchema,
  updateClubBodySchema,
} from "./club.schemas.js";

export const clubRoutes = Router();

clubRoutes.use(authorize(UserRole.SUPER_ADMIN));
clubRoutes.get("/", clubController.list);
clubRoutes.post(
  "/",
  validate({ body: clubBodySchema }),
  clubController.create,
);
clubRoutes.patch(
  "/:clubId",
  validate({ params: clubParamsSchema, body: updateClubBodySchema }),
  clubController.update,
);
clubRoutes.delete(
  "/:clubId",
  validate({ params: clubParamsSchema, body: deleteClubBodySchema }),
  clubController.remove,
);
