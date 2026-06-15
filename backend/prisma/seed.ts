import {
  ClubRole,
  PrismaClient,
  VehicleStatus,
  VehicleType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const defaultPassword = "ClubHub2026!";

const clubs = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Atlético Clube",
    slug: "atletico-clube",
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
    mileage: 48320,
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
    mileage: 126800,
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
    mileage: 65500,
    type: VehicleType.VAN,
    status: VehicleStatus.ACTIVE,
    inspectionDate: new Date("2026-10-15"),
    insuranceDate: new Date("2026-12-01"),
    notes: "Transporte das camadas jovens.",
  },
];

async function main() {
  for (const club of clubs) {
    await prisma.club.upsert({
      where: { id: club.id },
      update: { name: club.name, slug: club.slug },
      create: club,
    });
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@clubhub.pt" },
    update: { name: "Nuno Silva", passwordHash, isActive: true },
    create: {
      name: "Nuno Silva",
      email: "admin@clubhub.pt",
      passwordHash,
    },
  });
  const member = await prisma.user.upsert({
    where: { email: "membro@clubhub.pt" },
    update: { name: "Maria Costa", passwordHash, isActive: true },
    create: {
      name: "Maria Costa",
      email: "membro@clubhub.pt",
      passwordHash,
    },
  });
  const secondAdmin = await prisma.user.upsert({
    where: { email: "admin.vila@clubhub.pt" },
    update: { name: "João Martins", passwordHash, isActive: true },
    create: {
      name: "João Martins",
      email: "admin.vila@clubhub.pt",
      passwordHash,
    },
  });

  await prisma.membership.upsert({
    where: { userId_clubId: { userId: admin.id, clubId: clubs[0].id } },
    update: { role: ClubRole.ADMIN, isActive: true },
    create: { userId: admin.id, clubId: clubs[0].id, role: ClubRole.ADMIN },
  });
  await prisma.membership.deleteMany({
    where: { userId: admin.id, clubId: clubs[1].id },
  });
  await prisma.membership.upsert({
    where: { userId_clubId: { userId: secondAdmin.id, clubId: clubs[1].id } },
    update: { role: ClubRole.ADMIN, isActive: true },
    create: {
      userId: secondAdmin.id,
      clubId: clubs[1].id,
      role: ClubRole.ADMIN,
    },
  });
  await prisma.membership.upsert({
    where: { userId_clubId: { userId: member.id, clubId: clubs[0].id } },
    update: { role: ClubRole.MEMBER, isActive: true },
    create: {
      userId: member.id,
      clubId: clubs[0].id,
      role: ClubRole.MEMBER,
    },
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
