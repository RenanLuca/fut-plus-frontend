import { httpClient } from "@/src/app/lib/http-client";

export type MatchTeamRosterPlayer = { userId: string } | { guestUserId: string };

export type MatchTeamRoster = {
  matchTeamId: string;
  players: MatchTeamRosterPlayer[];
};

export async function replaceAll(
  groupId: string,
  matchId: string,
  teams: MatchTeamRoster[],
): Promise<void> {
  await httpClient.put(
    `/groups/${groupId}/group-matches/${matchId}/match-team-players`,
    teams,
  );
}
