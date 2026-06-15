import { ClubRole } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { hashPassword } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

export class UserService {
  listByClub(clubId: string) {
    return prisma.membership.findMany({
      where: { clubId },
      select: {
        id: true,
        role: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    });
  }

  async create(
    clubId: string,
    input: { name: string; email: string; password: string; role: ClubRole },
  ) {
    return prisma.$transaction(async (transaction) => {
      let user = await transaction.user.findUnique({ where: { email: input.email } });

      if (!user) {
        user = await transaction.user.create({
          data: {
            name: input.name,
            email: input.email,
            passwordHash: await hashPassword(input.password),
          },
        });
      }

      const existing = await transaction.membership.findUnique({
        where: { userId_clubId: { userId: user.id, clubId } },
      });

      if (existing) {
        throw new AppError("Este utilizador já pertence ao clube.", 409);
      }

      return transaction.membership.create({
        data: { userId: user.id, clubId, role: input.role },
        select: {
          id: true,
          role: true,
          isActive: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, isActive: true },
          },
        },
      });
    });
  }

  async updateMembership(
    clubId: string,
    membershipId: string,
    actorMembershipId: string,
    input: { role?: ClubRole; isActive?: boolean },
  ) {
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, clubId },
    });
    if (!membership) throw new AppError("Inscrição não encontrada.", 404);

    if (membership.id === actorMembershipId && input.isActive === false) {
      throw new AppError("Não pode desativar a sua própria inscrição.", 422);
    }

    if (
      membership.role === ClubRole.ADMIN &&
      (input.role !== undefined && input.role !== ClubRole.ADMIN ||
        input.isActive === false)
    ) {
      const adminCount = await prisma.membership.count({
        where: { clubId, role: ClubRole.ADMIN, isActive: true },
      });
      if (adminCount <= 1) {
        throw new AppError("O clube deve manter pelo menos um administrador ativo.", 422);
      }
    }

    return prisma.membership.update({
      where: { id: membershipId },
      data: input,
      select: {
        id: true,
        role: true,
        isActive: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, isActive: true },
        },
      },
    });
  }
}

export const userService = new UserService();
