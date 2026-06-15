import { ClubRole, UserRole } from "@prisma/client";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize.js";
import { requireClubContext } from "../../middlewares/club-context.js";
import { validate } from "../../middlewares/validate.js";
import { clubController } from "./club.controller.js";
import {
  clubBodySchema,
  clubParamsSchema,
  deleteClubBodySchema,
  updateClubThemeSchema,
  updateClubBodySchema,
} from "./club.schemas.js";

export const clubRoutes = Router();

clubRoutes.patch(
  "/current/theme",
  requireClubContext,
  authorize(UserRole.SUPER_ADMIN, ClubRole.ADMIN),
  validate({ body: updateClubThemeSchema }),
  clubController.updateTheme,
);

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
