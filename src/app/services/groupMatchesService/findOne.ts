import { httpClient } from "@/src/app/lib/http-client";
import type { GroupMatch } from "./findAll";

export async function findOne(
  groupId: string,
  matchId: string,
): Promise<GroupMatch> {
  const { data } = await httpClient.get<GroupMatch>(
    `/groups/${groupId}/group-matches/${matchId}`,
  );
  return data;
}
