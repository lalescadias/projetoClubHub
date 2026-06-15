import type { RequestHandler } from "express";

export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    message: `Rota não encontrada: ${request.method} ${request.path}`,
  });
};
