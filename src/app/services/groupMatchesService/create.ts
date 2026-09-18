import { httpClient } from "@/src/app/lib/http-client";
import type { GroupMatch } from "./findAll";

export type CreateGroupMatchPayload = {
  matchDate: string;
};

export async function create(
  groupId: string,
  payload: CreateGroupMatchPayload,
): Promise<GroupMatch> {
  const { data } = await httpClient.post<GroupMatch>(
    `/groups/${groupId}/group-matches`,
    payload,
  );
  return data;
}
