import type { RequestHandler } from "express";
import { notificationService } from "./notification.service.js";

export const notificationController = {
  list: (async (request, response) => {
    const notifications = await notificationService.listByClub(
      request.auth!.clubId!,
      request.auth!.membershipId!,
    );
    response.json({ data: notifications });
  }) satisfies RequestHandler,

  dismiss: (async (request, response) => {
    await notificationService.dismiss(
      request.auth!.clubId!,
      request.auth!.membershipId!,
      request.params.notificationId as string,
    );
    response.status(204).send();
  }) satisfies RequestHandler,
};
