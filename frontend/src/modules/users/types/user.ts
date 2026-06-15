import type { ClubRole } from "../../auth/types/auth";

export type ClubUser = {
  id: string;
  role: ClubRole;
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
};

export type CreateClubUserPayload = {
  name: string;
  email: string;
  password: string;
  role: ClubRole;
};

export type UpdateClubUserPayload = {
  name?: string;
  email?: string;
  role?: ClubRole;
  isActive?: boolean;
};
