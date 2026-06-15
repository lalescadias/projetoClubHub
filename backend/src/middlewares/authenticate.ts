import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export const authenticate: RequestHandler = async (request, _response, next) => {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Autenticação necessária.", 401);
  }

  try {
    const payload = verifyAccessToken(authorization.slice(7));
    const membership = await prisma.membership.findFirst({
      where: {
        id: payload.membershipId,
        userId: payload.sub,
        clubId: payload.clubId,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
        user: { select: { id: true, isActive: true } },
      },
    });

    if (!membership?.isActive || !membership.user.isActive) {
      throw new AppError("A conta ou inscrição está inativa.", 403);
    }

    request.auth = {
      userId: membership.user.id,
      clubId: payload.clubId,
      membershipId: membership.id,
      role: membership.role,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("A sessão expirou ou é inválida.", 401);
  }
};
