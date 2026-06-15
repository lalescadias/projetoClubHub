import { ClubRole, UserRole } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { hashPassword, type AccessRole } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

type ManagedRole = AccessRole;
type UserUpdate = {
  name?: string;
  email?: string;
  role?: ManagedRole;
  isActive?: boolean;
};

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
  async listByClub(clubId: string) {
    const [memberships, superAdmins] = await prisma.$transaction([
      prisma.membership.findMany({
        where: { clubId },
        select: membershipSelect,
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      }),
      prisma.user.findMany({
        where: { role: UserRole.SUPER_ADMIN },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      }),
    ]);

    return [
      ...superAdmins.map((user) => ({
        id: user.id,
        role: UserRole.SUPER_ADMIN,
        isActive: user.isActive,
        createdAt: user.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      })),
      ...memberships,
    ];
  }

  async create(
    clubId: string,
    actorRole: AccessRole,
    input: { name: string; email: string; password: string; role: ManagedRole },
  ) {
    this.assertCanAssignRole(actorRole, input.role);

    if (input.role === UserRole.SUPER_ADMIN) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new AppError("Já existe um utilizador com este email.", 409);
      }
      return prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
          role: UserRole.SUPER_ADMIN,
        },
        select: {
          id: true,
          role: true,
          isActive: true,
          createdAt: true,
          name: true,
          email: true,
        },
      }).then((user) => ({
        id: user.id,
        role: UserRole.SUPER_ADMIN,
        isActive: user.isActive,
        createdAt: user.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      }));
    }

    return prisma.$transaction(async (transaction) => {
      let user = await transaction.user.findUnique({
        where: { email: input.email },
      });
      if (user?.role === UserRole.SUPER_ADMIN) {
        throw new AppError("Este email pertence a um superadministrador.", 409);
      }
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
        data: { userId: user.id, clubId, role: input.role as ClubRole },
        select: membershipSelect,
      });
    });
  }

  async update(
    clubId: string,
    targetId: string,
    actorUserId: string,
    actorRole: AccessRole,
    input: UserUpdate,
  ) {
    const globalUser = await prisma.user.findFirst({
      where: { id: targetId, role: UserRole.SUPER_ADMIN },
    });
    if (globalUser) {
      return this.updateSuperAdmin(
        clubId,
        globalUser,
        actorUserId,
        actorRole,
        input,
      );
    }

    const membership = await prisma.membership.findFirst({
      where: { id: targetId, clubId },
      include: { user: true },
    });
    if (!membership) throw new AppError("Utilizador não encontrado.", 404);

    if (membership.role === ClubRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
      throw new AppError(
        "Apenas um superadministrador pode gerir administradores.",
        403,
      );
    }
    if (input.role) this.assertCanAssignRole(actorRole, input.role);
    if (membership.userId === actorUserId && input.isActive === false) {
      throw new AppError("Não pode desativar a sua própria conta.", 422);
    }

    if (input.role === UserRole.SUPER_ADMIN) {
      return prisma.$transaction(async (transaction) => {
        await transaction.membership.deleteMany({
          where: { userId: membership.userId },
        });
        const user = await transaction.user.update({
          where: { id: membership.userId },
          data: {
            role: UserRole.SUPER_ADMIN,
            isActive: true,
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
          },
        });
        return this.serializeSuperAdmin(user);
      });
    }

    await this.validateIdentityUpdate(membership.userId, membership.user.email, input);
    return prisma.$transaction(async (transaction) => {
      if (input.name !== undefined || input.email !== undefined) {
        await transaction.user.update({
          where: { id: membership.userId },
          data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
          },
        });
      }
      return transaction.membership.update({
        where: { id: membership.id },
        data: {
          ...(input.role !== undefined && {
            role: input.role as ClubRole,
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
        select: membershipSelect,
      });
    });
  }

  async remove(
    clubId: string,
    targetId: string,
    actorUserId: string,
    actorRole: AccessRole,
  ) {
    const globalUser = await prisma.user.findFirst({
      where: { id: targetId, role: UserRole.SUPER_ADMIN },
    });
    if (globalUser) {
      if (actorRole !== UserRole.SUPER_ADMIN) {
        throw new AppError(
          "Apenas um superadministrador pode remover outro superadministrador.",
          403,
        );
      }
      if (globalUser.id === actorUserId) {
        throw new AppError("Não pode apagar a sua própria conta.", 422);
      }
      await this.ensureAnotherSuperAdmin(globalUser.id);
      await prisma.user.delete({ where: { id: globalUser.id } });
      return;
    }

    const membership = await prisma.membership.findFirst({
      where: { id: targetId, clubId },
    });
    if (!membership) throw new AppError("Utilizador não encontrado.", 404);
    if (membership.role === ClubRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
      throw new AppError(
        "Apenas um superadministrador pode remover administradores.",
        403,
      );
    }
    if (membership.userId === actorUserId) {
      throw new AppError("Não pode apagar a sua própria inscrição.", 422);
    }
    await prisma.$transaction(async (transaction) => {
      await transaction.membership.delete({ where: { id: membership.id } });
      const remaining = await transaction.membership.count({
        where: { userId: membership.userId },
      });
      if (remaining === 0) {
        await transaction.user.delete({ where: { id: membership.userId } });
      }
    });
  }

  private async updateSuperAdmin(
    clubId: string,
    user: {
      id: string;
      name: string;
      email: string;
      passwordHash: string;
      role: UserRole;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    actorUserId: string,
    actorRole: AccessRole,
    input: UserUpdate,
  ) {
    if (actorRole !== UserRole.SUPER_ADMIN) {
      throw new AppError(
        "Apenas um superadministrador pode gerir outro superadministrador.",
        403,
      );
    }
    if (input.role) this.assertCanAssignRole(actorRole, input.role);
    if (user.id === actorUserId && input.isActive === false) {
      throw new AppError("Não pode desativar a sua própria conta.", 422);
    }
    if (
      input.isActive === false ||
      (input.role !== undefined && input.role !== UserRole.SUPER_ADMIN)
    ) {
      await this.ensureAnotherSuperAdmin(user.id);
    }
    await this.validateEmail(user.id, user.email, input.email);

    if (input.role && input.role !== UserRole.SUPER_ADMIN) {
      return prisma.$transaction(async (transaction) => {
        const updated = await transaction.user.update({
          where: { id: user.id },
          data: {
            role: UserRole.STANDARD,
            ...(input.name !== undefined && { name: input.name }),
            ...(input.email !== undefined && { email: input.email }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
          },
        });
        return transaction.membership.create({
          data: {
            userId: updated.id,
            clubId,
            role: input.role as ClubRole,
            isActive: input.isActive ?? true,
          },
          select: membershipSelect,
        });
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });
    return this.serializeSuperAdmin(updated);
  }

  private assertCanAssignRole(actorRole: AccessRole, role: ManagedRole) {
    if (actorRole === UserRole.SUPER_ADMIN) return;
    if (role === UserRole.SUPER_ADMIN) {
      throw new AppError(
        "Apenas um superadministrador pode criar ou promover superadministradores.",
        403,
      );
    }
  }

  private async validateIdentityUpdate(
    userId: string,
    currentEmail: string,
    input: UserUpdate,
  ) {
    if (input.name === undefined && input.email === undefined) return;
    const count = await prisma.membership.count({ where: { userId } });
    if (count > 1) {
      throw new AppError(
        "Este utilizador pertence a mais de um clube. O nome e o email não podem ser alterados por um clube.",
        422,
      );
    }
    await this.validateEmail(userId, currentEmail, input.email);
  }

  private async validateEmail(
    userId: string,
    currentEmail: string,
    nextEmail?: string,
  ) {
    if (!nextEmail || nextEmail === currentEmail) return;
    const existing = await prisma.user.findUnique({
      where: { email: nextEmail },
      select: { id: true },
    });
    if (existing && existing.id !== userId) {
      throw new AppError("Já existe um utilizador com este email.", 409);
    }
  }

  private async ensureAnotherSuperAdmin(excludedUserId: string) {
    const other = await prisma.user.findFirst({
      where: {
        id: { not: excludedUserId },
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      select: { id: true },
    });
    if (!other) {
      throw new AppError(
        "O sistema deve manter pelo menos um superadministrador ativo.",
        422,
      );
    }
  }

  private serializeSuperAdmin(user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      role: UserRole.SUPER_ADMIN,
      isActive: user.isActive,
      createdAt: user.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    };
  }
}

export const userService = new UserService();
