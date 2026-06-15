import type { RequestHandler } from "express";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  list: (async (request, response) => {
    const notifications = await notificationService.listByClub(
      request.auth!.clubId!,
    );
    response.json({ data: notifications });
  }) satisfies RequestHandler,
};
