import { ClubRole } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { hashPassword } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

const membershipSelect = {
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
} as const;

export class UserService {
  listByClub(clubId: string) {
    return prisma.membership.findMany({
      where: { clubId },
      select: membershipSelect,
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    });
  }

  async create(
    clubId: string,
    input: { name: string; email: string; password: string; role: ClubRole },
  ) {
    return prisma.$transaction(async (transaction) => {
      let user = await transaction.user.findUnique({
        where: { email: input.email },
      });

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
        select: membershipSelect,
      });
    });
  }

  async updateMembership(
    clubId: string,
    membershipId: string,
    actorMembershipId: string,
    input: {
      name?: string;
      email?: string;
      role?: ClubRole;
      isActive?: boolean;
    },
  ) {
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, clubId },
      include: { user: true },
    });
    if (!membership) throw new AppError("Inscrição não encontrada.", 404);

    if (membership.id === actorMembershipId && input.isActive === false) {
      throw new AppError("Não pode desativar a sua própria inscrição.", 422);
    }

    if (
      membership.role === ClubRole.ADMIN &&
      ((input.role !== undefined && input.role !== ClubRole.ADMIN) ||
        input.isActive === false)
    ) {
      await this.ensureAnotherActiveAdmin(clubId);
    }

    const updatesIdentity =
      input.name !== undefined || input.email !== undefined;

    if (updatesIdentity) {
      const membershipCount = await prisma.membership.count({
        where: { userId: membership.userId },
      });
      if (membershipCount > 1) {
        throw new AppError(
          "Este utilizador pertence a mais de um clube. O nome e o email não podem ser alterados por um clube.",
          422,
        );
      }

      if (input.email && input.email !== membership.user.email) {
        const emailInUse = await prisma.user.findUnique({
          where: { email: input.email },
          select: { id: true },
        });
        if (emailInUse && emailInUse.id !== membership.userId) {
          throw new AppError("Já existe um utilizador com este email.", 409);
        }
      }
    }

    return prisma.$transaction(async (transaction) => {
      if (updatesIdentity) {
        await transaction.user.update({
          where: { id: membership.userId },
          data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
          },
        });
      }

      return transaction.membership.update({
        where: { id: membershipId },
        data: {
          ...(input.role !== undefined && { role: input.role }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        select: membershipSelect,
      });
    });
  }

  async removeMembership(
    clubId: string,
    membershipId: string,
    actorMembershipId: string,
  ) {
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, clubId },
    });
    if (!membership) throw new AppError("Inscrição não encontrada.", 404);

    if (membership.id === actorMembershipId) {
      throw new AppError("Não pode apagar a sua própria inscrição.", 422);
    }

    if (membership.role === ClubRole.ADMIN && membership.isActive) {
      await this.ensureAnotherActiveAdmin(clubId);
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.membership.delete({ where: { id: membershipId } });
      const remainingMemberships = await transaction.membership.count({
        where: { userId: membership.userId },
      });
      if (remainingMemberships === 0) {
        await transaction.user.delete({ where: { id: membership.userId } });
      }
    });
  }

  private async ensureAnotherActiveAdmin(clubId: string) {
    const adminCount = await prisma.membership.count({
      where: { clubId, role: ClubRole.ADMIN, isActive: true },
    });
    if (adminCount <= 1) {
      throw new AppError(
        "O clube deve manter pelo menos um administrador ativo.",
        422,
      );
    }
  }
}

export const userService = new UserService();
