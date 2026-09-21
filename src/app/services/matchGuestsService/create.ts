import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";
import type { Rank } from "@/src/app/constants/rank";

export type CreateMatchGuestPayload = {
  name: string;
  position: Position;
  rank: Rank;
};

export type MatchGuest = {
  id: string;
  groupMatchId: string;
  name: string;
  position: Position;
  rank: Rank;
  createdAt: string;
  updatedAt: string;
};

export async function create(
  groupId: string,
  matchId: string,
  payload: CreateMatchGuestPayload,
): Promise<MatchGuest> {
  const { data } = await httpClient.post<MatchGuest>(
    `/groups/${groupId}/group-matches/${matchId}/guests`,
    payload,
  );
  return data;
}
