import { Router } from "express";
import { notificationController } from "./notification.controller.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", notificationController.list);
