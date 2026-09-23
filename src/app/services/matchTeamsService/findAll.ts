import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";
import type { Rank } from "@/src/app/constants/rank";

export type MatchTeamPlayerUser = {
  id: string;
  name: string;
  position: Position;
  profilePicture: string | null;
  rank: Rank | null;
};

export type MatchTeamPlayerGuestUser = {
  id: string;
  groupMatchId: string;
  name: string;
  position: Position;
  rank: Rank;
  createdAt: string;
  updatedAt: string;
};

export type MatchTeamPlayer = {
  user: MatchTeamPlayerUser | null;
  guestUser: MatchTeamPlayerGuestUser | null;
};

export type MatchTeam = {
  id: string;
  groupMatchId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  matchTeamPlayers: MatchTeamPlayer[];
};

export async function findAll(
  groupId: string,
  matchId: string,
): Promise<MatchTeam[]> {
  const { data } = await httpClient.get<MatchTeam[]>(
    `/groups/${groupId}/group-matches/${matchId}/match-teams`,
  );
  return data;
}
