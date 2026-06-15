import { ClubRole, UserRole } from "@prisma/client";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { userController } from "./user.controller.js";
import {
  createClubUserSchema,
  deleteMembershipBodySchema,
  membershipParamsSchema,
  updateMembershipSchema,
} from "./user.schemas.js";

export const userRoutes = Router();

userRoutes.use(authorize(UserRole.SUPER_ADMIN, ClubRole.ADMIN));
userRoutes.get("/", userController.list);
userRoutes.post(
  "/",
  validate({ body: createClubUserSchema }),
  userController.create,
);
userRoutes.patch(
  "/:membershipId",
  validate({ params: membershipParamsSchema, body: updateMembershipSchema }),
  userController.update,
);
userRoutes.delete(
  "/:membershipId",
  validate({
    params: membershipParamsSchema,
    body: deleteMembershipBodySchema,
  }),
  userController.remove,
);
