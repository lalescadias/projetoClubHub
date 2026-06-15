import type { ClubRole, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AccessRole = ClubRole | Extract<UserRole, "SUPER_ADMIN">;

type AccessTokenPayload = {
  sub: string;
  clubId?: string;
  membershipId?: string;
  role: AccessRole;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(
  userId: string,
  context: {
    role: AccessRole;
    clubId?: string;
    membershipId?: string;
  },
) {
  return jwt.sign(
    {
      sub: userId,
      clubId: context.clubId,
      membershipId: context.membershipId,
      role: context.role,
    } satisfies AccessTokenPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
  );
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

  if (!payload.sub || !payload.role) {
    throw new Error("Invalid token payload");
  }

  return payload;
}
