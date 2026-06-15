import { z } from "zod";

export const notificationParamsSchema = z.object({
  notificationId: z.string().trim().min(1).max(240),
});
