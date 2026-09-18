import { httpClient } from "@/src/app/lib/http-client";
import type { MatchTeam } from "./findAll";

export type GenerateMatchTeamsPayload = {
  teamCount: number;
};

export async function generate(
  groupId: string,
  matchId: string,
  payload: GenerateMatchTeamsPayload,
): Promise<MatchTeam[]> {
  const { data } = await httpClient.post<MatchTeam[]>(
    `/groups/${groupId}/group-matches/${matchId}/match-teams/generate`,
    payload,
  );
  return data;
}
