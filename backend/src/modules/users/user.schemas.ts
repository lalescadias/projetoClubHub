import { z } from "zod";

const managedRoleSchema = z.enum(["SUPER_ADMIN", "ADMIN", "MEMBER"]);

export const createClubUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  role: managedRoleSchema,
});

export const updateMembershipSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase())
      .optional(),
    role: managedRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.email !== undefined ||
      value.role !== undefined ||
      value.isActive !== undefined,
    { message: "Indique pelo menos uma alteração." },
  );

export const deleteMembershipBodySchema = z.object({
  confirmation: z.literal("delete", {
    errorMap: () => ({
      message: 'Escreva "delete" para confirmar a eliminação.',
    }),
  }),
});

export const membershipParamsSchema = z.object({
  membershipId: z.string().uuid(),
});
