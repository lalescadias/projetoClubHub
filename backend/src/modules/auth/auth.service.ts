import { AppError } from "../../errors/app-error.js";
import {
  hashPassword,
  signAccessToken,
  verifyPassword,
} from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";

export class AuthService {
  async login(clubSlug: string, email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { isActive: true, club: { slug: clubSlug } },
          include: { club: true },
        },
      },
    });

    if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError("Clube, email ou palavra-passe inválidos.", 401);
    }

    const membership = user.memberships[0];
    if (!membership) {
      throw new AppError("Clube, email ou palavra-passe inválidos.", 401);
    }

    return {
      accessToken: signAccessToken(user.id, membership),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        membership: {
          id: membership.id,
          role: membership.role,
          club: {
            id: membership.club.id,
            name: membership.club.name,
            slug: membership.club.slug,
          },
        },
      },
    };
  }

  async getSession(userId: string, membershipId: string) {
    const membership = await prisma.membership.findFirst({
      where: { id: membershipId, userId, isActive: true },
      include: {
        club: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!membership) throw new AppError("Sessão de clube inválida.", 401);
    return {
      ...membership.user,
      membership: {
        id: membership.id,
        role: membership.role,
        club: membership.club,
      },
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
