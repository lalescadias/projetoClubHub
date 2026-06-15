import type { ClubRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        clubId?: string;
        role?: ClubRole;
        membershipId?: string;
      };
    }
  }
}

export {};
