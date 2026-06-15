export type ManagedClub = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    memberships: number;
    vehicles: number;
  };
};

export type ClubPayload = {
  name: string;
  slug: string;
};
