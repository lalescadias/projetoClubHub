export type ClubRole = "ADMIN" | "MEMBER";

export type Club = {
  id: string;
  name: string;
  slug: string;
};

export type Membership = {
  id: string;
  role: ClubRole;
  club: Club;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  membership: Membership;
};

export type LoginResponse = {
  accessToken: string;
  user: SessionUser;
};
