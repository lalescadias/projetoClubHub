import type { RequestHandler } from "express";
import { clubService } from "./club.service.js";

export const clubController = {
  list: (async (_request, response) => {
    response.json({ data: await clubService.list() });
  }) satisfies RequestHandler,

  create: (async (request, response) => {
    const club = await clubService.create(request.body);
    response.status(201).json({ data: club });
  }) satisfies RequestHandler,

  update: (async (request, response) => {
    const club = await clubService.update(
      request.params.clubId as string,
      request.body,
    );
    response.json({ data: club });
  }) satisfies RequestHandler,

  remove: (async (request, response) => {
    await clubService.remove(request.params.clubId as string);
    response.status(204).send();
  }) satisfies RequestHandler,
};
