import type { ClubRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

type AccessTokenPayload = {
  sub: string;
  clubId: string;
  membershipId: string;
  role: ClubRole;
};

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(
  userId: string,
  membership: { id: string; clubId: string; role: ClubRole },
) {
  return jwt.sign(
    {
      sub: userId,
      clubId: membership.clubId,
      membershipId: membership.id,
      role: membership.role,
    } satisfies AccessTokenPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
  );
}

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;

  if (!payload.sub || !payload.clubId || !payload.membershipId || !payload.role) {
    throw new Error("Invalid token payload");
  }

  return payload;
}
