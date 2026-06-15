import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
export const requireClubContext: RequestHandler = async (request, _response, next) => {
  if (!request.auth?.userId) {
    throw new AppError("Autenticação necessária.", 401);
  }

  if (!request.auth.clubId || !request.auth.membershipId || !request.auth.role) {
    throw new AppError("A sessão não está associada a um clube.", 401);
  }
  next();
};
