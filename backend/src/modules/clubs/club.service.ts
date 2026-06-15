import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";

const clubSelect = {
  id: true,
  name: true,
  slug: true,
  themeColor: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      memberships: true,
      vehicles: true,
    },
  },
} as const;

export class ClubService {
  list() {
    return prisma.club.findMany({
      select: clubSelect,
      orderBy: { name: "asc" },
    });
  }

  async create(input: { name: string; slug: string }) {
    const existing = await prisma.club.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (existing) {
      throw new AppError("Já existe um clube com este código.", 409);
    }
    return prisma.club.create({
      data: input,
      select: clubSelect,
    });
  }

  async update(
    clubId: string,
    input: { name?: string; slug?: string },
  ) {
    await this.getById(clubId);
    if (input.slug) {
      const existing = await prisma.club.findFirst({
        where: { slug: input.slug, id: { not: clubId } },
        select: { id: true },
      });
      if (existing) {
        throw new AppError("Já existe um clube com este código.", 409);
      }
    }
    return prisma.club.update({
      where: { id: clubId },
      data: input,
      select: clubSelect,
    });
  }

  async remove(clubId: string) {
    await this.getById(clubId);
    const clubCount = await prisma.club.count();
    if (clubCount <= 1) {
      throw new AppError(
        "A plataforma deve manter pelo menos um clube.",
        422,
      );
    }
    await prisma.club.delete({ where: { id: clubId } });
  }

  async updateTheme(clubId: string, themeColor: string) {
    await this.getById(clubId);
    return prisma.club.update({
      where: { id: clubId },
      data: { themeColor },
      select: {
        id: true,
        name: true,
        slug: true,
        themeColor: true,
      },
    });
  }

  private async getById(clubId: string) {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true },
    });
    if (!club) throw new AppError("Clube não encontrado.", 404);
    return club;
  }
}

export const clubService = new ClubService();
