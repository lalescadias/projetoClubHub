import { UserRole } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import {
  hashPassword,
  signAccessToken,
  verifyPassword,
} from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

const clubSelect = {
  id: true,
  name: true,
  slug: true,
  themeColor: true,
} as const;

export class AuthService {
  async login(clubSlug: string | undefined, email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: clubSlug
            ? { isActive: true, club: { slug: clubSlug } }
            : { isActive: true },
          include: { club: true },
        },
      },
    });

    if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError("Clube, email ou palavra-passe inválidos.", 401);
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      const club = clubSlug
        ? await prisma.club.findUnique({
            where: { slug: clubSlug },
            select: clubSelect,
          })
        : null;
      if (clubSlug && !club) {
        throw new AppError("O clube indicado não existe.", 401);
      }

      return {
        accessToken: signAccessToken(user.id, {
          role: UserRole.SUPER_ADMIN,
          clubId: club?.id,
        }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: UserRole.SUPER_ADMIN,
          membership: null,
          club,
        },
      };
    }

    if (!clubSlug) {
      throw new AppError("Indique o código do clube.", 422);
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new AppError("Clube, email ou palavra-passe inválidos.", 401);
    }

    return {
      accessToken: signAccessToken(user.id, {
        role: membership.role,
        membershipId: membership.id,
        clubId: membership.clubId,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: membership.role,
        membership: {
          id: membership.id,
          role: membership.role,
          club: {
            id: membership.club.id,
            name: membership.club.name,
            slug: membership.club.slug,
            themeColor: membership.club.themeColor,
          },
        },
        club: {
          id: membership.club.id,
          name: membership.club.name,
          slug: membership.club.slug,
          themeColor: membership.club.themeColor,
        },
      },
    };
  }

  async getSession(
    userId: string,
    role: "SUPER_ADMIN" | "ADMIN" | "MEMBER",
    membershipId?: string,
    clubId?: string,
  ) {
    if (role === UserRole.SUPER_ADMIN) {
      const user = await prisma.user.findFirst({
        where: { id: userId, role: UserRole.SUPER_ADMIN, isActive: true },
        select: { id: true, name: true, email: true },
      });
      if (!user) throw new AppError("Sessão global inválida.", 401);
      const club = clubId
        ? await prisma.club.findUnique({
            where: { id: clubId },
            select: clubSelect,
          })
        : null;
      return {
        ...user,
        role: UserRole.SUPER_ADMIN,
        membership: null,
        club,
      };
    }

    if (!membershipId) throw new AppError("Sessão de clube inválida.", 401);
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, userId, isActive: true },
      include: {
        club: { select: clubSelect },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!membership) throw new AppError("Sessão de clube inválida.", 401);
    return {
      ...membership.user,
      role: membership.role,
      membership: {
        id: membership.id,
        role: membership.role,
        club: membership.club,
      },
      club: membership.club,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("Utilizador não encontrado.", 404);

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new AppError("A palavra-passe atual está incorreta.", 422);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });
  }
}

export const authService = new AuthService();
