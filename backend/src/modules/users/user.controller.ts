import type { RequestHandler } from "express";
import { userService } from "./user.service.js";

export const userController = {
  list: (async (request, response) => {
    const users = await userService.listByClub(request.auth!.clubId!);
    response.json({ data: users });
  }) satisfies RequestHandler,

  create: (async (request, response) => {
    const membership = await userService.create(
      request.auth!.clubId!,
      request.auth!.role!,
      request.body,
    );
    response.status(201).json({ data: membership });
  }) satisfies RequestHandler,

  update: (async (request, response) => {
    const membership = await userService.update(
      request.auth!.clubId!,
      request.params.membershipId as string,
      request.auth!.userId,
      request.auth!.role!,
      request.body,
    );
    response.json({ data: membership });
  }) satisfies RequestHandler,

  remove: (async (request, response) => {
    await userService.remove(
      request.auth!.clubId!,
      request.params.membershipId as string,
      request.auth!.userId,
      request.auth!.role!,
    );
    response.status(204).send();
  }) satisfies RequestHandler,
};
