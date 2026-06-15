import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const requireClubContext: RequestHandler = async (
  request,
  _response,
  next,
) => {
  if (!request.auth?.userId) {
    throw new AppError("Autenticação necessária.", 401);
  }

  if (!request.auth.clubId || !request.auth.role) {
    throw new AppError(
      "A sessão não tem um clube de trabalho selecionado.",
      401,
    );
  }
  next();
};
