import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";
import type { Rank } from "@/src/app/constants/rank";

export type MatchPresenceMember = {
  id: string;
  name: string;
  position: Position;
  profilePicture: string | null;
  isGuest: boolean;
  rank: Rank | null;
};

export type MatchPresences = {
  confirmed: MatchPresenceMember[];
  declined: MatchPresenceMember[];
  pending: MatchPresenceMember[];
};

export async function findAll(
  groupId: string,
  matchId: string,
): Promise<MatchPresences> {
  const { data } = await httpClient.get<MatchPresences>(
    `/groups/${groupId}/group-matches/${matchId}/match-presences`,
  );
  return data;
}
