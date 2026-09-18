import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";

export type MatchTeamPlayerUser = {
  id: string;
  name: string;
  position: Position;
  profilePicture: string | null;
};

export type MatchTeamPlayerGuestUser = {
  id: string;
  name: string;
  position: Position;
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
