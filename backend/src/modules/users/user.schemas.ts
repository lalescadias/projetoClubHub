import { ClubRole } from "@prisma/client";
import { z } from "zod";

export const createClubUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  role: z.nativeEnum(ClubRole),
});

export const updateMembershipSchema = z
  .object({
    role: z.nativeEnum(ClubRole).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    message: "Indique pelo menos uma alteração.",
  });

export const membershipParamsSchema = z.object({
  membershipId: z.string().uuid(),
});
