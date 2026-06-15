import type { AccessRole } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        clubId?: string;
        role: AccessRole;
        membershipId?: string;
      };
    }
  }
}

export {};
