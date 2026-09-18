import { httpClient } from "@/src/app/lib/http-client";

export type UpcomingMatch = {
  id: string;
  groupId: string;
  matchDate: string;
  createdAt: string;
  updatedAt: string;
  group: {
    id: string;
    name: string;
    valuePerUser: number;
  };
};

export async function findUpcomingMatch(): Promise<UpcomingMatch | null> {
  const { data } = await httpClient.get<UpcomingMatch | null>(
    "/users/me/upcoming-match",
  );
  return data;
}
