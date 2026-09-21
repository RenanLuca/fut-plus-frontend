import { httpClient } from "@/src/app/lib/http-client";
import type { MatchTeam } from "./findAll";

export type UpdateMatchTeamPayload = {
  name?: string;
  color?: string;
};

export async function update(
  groupId: string,
  matchId: string,
  matchTeamId: string,
  payload: UpdateMatchTeamPayload,
): Promise<MatchTeam> {
  const { data } = await httpClient.patch<MatchTeam>(
    `/groups/${groupId}/group-matches/${matchId}/match-teams/${matchTeamId}`,
    payload,
  );
  return data;
}
