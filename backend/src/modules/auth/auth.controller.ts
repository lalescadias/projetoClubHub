import type { RequestHandler } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  login: (async (request, response) => {
    const session = await authService.login(
      request.body.club,
      request.body.email,
      request.body.password,
    );
    response.json({ data: session });
  }) satisfies RequestHandler,

  me: (async (request, response) => {
    const user = await authService.getSession(
      request.auth!.userId,
      request.auth!.membershipId!,
    );
    response.json({ data: user });
  }) satisfies RequestHandler,

  changePassword: (async (request, response) => {
    await authService.changePassword(
      request.auth!.userId,
      request.body.currentPassword,
      request.body.newPassword,
    );
    response.status(204).send();
  }) satisfies RequestHandler,
};
