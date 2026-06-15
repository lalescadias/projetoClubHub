import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import type { AccessRole } from "../lib/auth.js";

export function authorize(...roles: AccessRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth?.role || !roles.includes(request.auth.role)) {
      throw new AppError("Não tem permissão para realizar esta ação.", 403);
    }
    next();
  };
}
