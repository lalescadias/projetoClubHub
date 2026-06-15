import {
  ClubRole,
  PrismaClient,
  UserRole,
  VehicleStatus,
  VehicleType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const clubs = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Sporting Covilhã",
    slug: "sporting-covilha",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Sporting da Vila",
    slug: "sporting-da-vila",
  },
];

const vehicles = [
  {
    clubId: clubs[0].id,
    plate: "AA-01-CH",
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2022,
    version: "Tourer",
    currentMileage: 48320,
    fuelType: "DIESEL" as const,
    type: VehicleType.VAN,
    status: VehicleStatus.ACTIVE,
    inspectionDate: new Date("2026-11-12"),
    insuranceDate: new Date("2026-09-30"),
    notes: "Carrinha principal da equipa sénior.",
  },
  {
    clubId: clubs[0].id,
    plate: "BB-22-HC",
    make: "MAN",
    model: "Lion's Coach",
    year: 2019,
    version: "L",
    currentMileage: 126800,
    fuelType: "DIESEL" as const,
    type: VehicleType.BUS,
    status: VehicleStatus.MAINTENANCE,
    inspectionDate: new Date("2026-08-05"),
    insuranceDate: new Date("2026-12-18"),
    notes: "Revisão do sistema de climatização.",
  },
  {
    clubId: clubs[1].id,
    plate: "SV-10-20",
    make: "Ford",
    model: "Transit",
    year: 2021,
    version: "350 L3H2",
    currentMileage: 65500,
    fuelType: "DIESEL" as const,
    type: VehicleType.VAN,
    status: VehicleStatus.ACTIVE,
    inspectionDate: new Date("2026-10-15"),
    insuranceDate: new Date("2026-12-01"),
    notes: "Transporte das camadas jovens.",
  },
];

async function seedSuperAdmin() {
  const name = process.env.SEED_SUPER_ADMIN_NAME;
  const emailValue = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!name || !emailValue) return false;
  if (password && password.length < 12) {
    throw new Error(
      "A palavra-passe do superadministrador deve ter pelo menos 12 caracteres.",
    );
  }

  const email = emailValue.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing && !password) {
    throw new Error(
      "SEED_SUPER_ADMIN_PASSWORD é obrigatória ao criar o superadministrador pela primeira vez.",
    );
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(password!, 12),
          role: UserRole.SUPER_ADMIN,
        },
      });
  await prisma.membership.deleteMany({ where: { userId: user.id } });
  return true;
}

async function seedAdmin(clubId: string) {
  const name = process.env.SEED_ADMIN_NAME;
  const emailValue = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!name || !emailValue) return;

  const email = emailValue.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing && (!password || password.length < 12)) {
    throw new Error(
      "SEED_ADMIN_PASSWORD com pelo menos 12 caracteres é obrigatória ao criar o administrador pela primeira vez.",
    );
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          role: UserRole.STANDARD,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(password!, 12),
          role: UserRole.STANDARD,
        },
      });

  await prisma.membership.upsert({
    where: {
      userId_clubId: { userId: user.id, clubId },
    },
    update: { role: ClubRole.ADMIN, isActive: true },
    create: {
      userId: user.id,
      clubId,
      role: ClubRole.ADMIN,
    },
  });
}

async function main() {
  const clubCount = await prisma.club.count();
  if (clubCount === 0) {
    await prisma.club.createMany({ data: clubs });
  }
  const defaultClub = await prisma.club.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!defaultClub) throw new Error("É obrigatório existir pelo menos um clube.");

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "admin@clubhub.pt",
          "membro@clubhub.pt",
          "admin.vila@clubhub.pt",
        ],
      },
    },
  });

  await seedSuperAdmin();
  await seedAdmin(defaultClub.id);

  for (const vehicle of vehicles) {
    const clubExists = await prisma.club.findUnique({
      where: { id: vehicle.clubId },
      select: { id: true },
    });
    if (!clubExists) continue;
    await prisma.vehicle.upsert({
      where: {
        clubId_plate: { clubId: vehicle.clubId, plate: vehicle.plate },
      },
      update: {},
      create: vehicle,
    });
  }

  let superAdminCount = await prisma.user.count({
    where: { role: UserRole.SUPER_ADMIN, isActive: true },
  });
  if (superAdminCount === 0) {
    const fallbackAdmin = await prisma.membership.findFirst({
      where: { role: ClubRole.ADMIN, isActive: true, user: { isActive: true } },
      orderBy: { createdAt: "asc" },
      select: { userId: true },
    });

    if (fallbackAdmin) {
      await prisma.user.update({
        where: { id: fallbackAdmin.userId },
        data: {
          role: UserRole.SUPER_ADMIN,
          isActive: true,
        },
      });
      await prisma.membership.deleteMany({
        where: { userId: fallbackAdmin.userId },
      });
      superAdminCount = await prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN, isActive: true },
      });
    }
  }

  if (superAdminCount === 0) {
    throw new Error(
      "É obrigatório configurar um SUPER_ADMIN ativo através das variáveis SEED_SUPER_ADMIN_*.",
    );
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
