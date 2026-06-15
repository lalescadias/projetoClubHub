export type ClubRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER";

export type Club = {
  id: string;
  name: string;
  slug: string;
};

export type Membership = {
  id: string;
  role: Exclude<ClubRole, "SUPER_ADMIN">;
  club: Club;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: ClubRole;
  membership: Membership | null;
  club: Club | null;
};

export type LoginResponse = {
  accessToken: string;
  user: SessionUser;
};
