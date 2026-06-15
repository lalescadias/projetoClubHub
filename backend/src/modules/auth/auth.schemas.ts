import { z } from "zod";

export const loginSchema = z.object({
  club: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .transform((value) => value.toLowerCase()),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(10, "A nova palavra-passe deve ter pelo menos 10 caracteres.")
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua pelo menos um número."),
});
