import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { notificationController } from "./notification.controller.js";
import { notificationParamsSchema } from "./notification.schemas.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", notificationController.list);
notificationRoutes.delete(
  "/:notificationId",
  validate({ params: notificationParamsSchema }),
  notificationController.dismiss,
);
