import { httpClient } from "@/src/app/lib/http-client";
import type { GroupMatch } from "@/src/app/services/groupMatchesService";

export async function findPendingMatches(
  groupId: string,
): Promise<GroupMatch[]> {
  const { data } = await httpClient.get<GroupMatch[]>(
    `/groups/${groupId}/group-payments/pending-matches`,
  );
  return data;
}
