import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use apenas letras minúsculas, números e hífenes.",
  );

export const clubBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
});

export const updateClubBodySchema = clubBodySchema.partial().refine(
  (value) => value.name !== undefined || value.slug !== undefined,
  { message: "Indique pelo menos uma alteração." },
);

export const clubParamsSchema = z.object({
  clubId: z.string().uuid(),
});

export const deleteClubBodySchema = z.object({
  confirmation: z.literal("delete", {
    errorMap: () => ({
      message: 'Escreva "delete" para confirmar a eliminação.',
    }),
  }),
});
