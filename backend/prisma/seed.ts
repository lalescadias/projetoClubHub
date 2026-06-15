import {
  ClubRole,
  PrismaClient,
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

async function seedUser(input: {
  clubId: string;
  name?: string;
  email?: string;
  password?: string;
  role: ClubRole;
}) {
  if (!input.name || !input.email || !input.password) return;

  if (input.password.length < 12) {
    throw new Error("As palavras-passe de bootstrap devem ter pelo menos 12 caracteres.");
  }

  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: input.name,
      passwordHash: await bcrypt.hash(input.password, 12),
      isActive: true,
    },
    create: {
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
    },
  });

  await prisma.membership.upsert({
    where: { userId_clubId: { userId: user.id, clubId: input.clubId } },
    update: { role: input.role, isActive: true },
    create: { userId: user.id, clubId: input.clubId, role: input.role },
  });
}

async function main() {
  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: { name: club.name, slug: club.slug },
      create: club,
    });
  }

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

  await seedUser({
    clubId: clubs[0].id,
    name: process.env.SEED_ADMIN_NAME,
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: ClubRole.ADMIN,
  });
  await seedUser({
    clubId: clubs[0].id,
    name: process.env.SEED_MEMBER_NAME,
    email: process.env.SEED_MEMBER_EMAIL,
    password: process.env.SEED_MEMBER_PASSWORD,
    role: ClubRole.MEMBER,
  });

  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: {
        clubId_plate: { clubId: vehicle.clubId, plate: vehicle.plate },
      },
      update: vehicle,
      create: vehicle,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
