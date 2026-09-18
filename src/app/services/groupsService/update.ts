import { httpClient } from "@/src/app/lib/http-client";
import type { Group } from "./findAll";
import type { CreateGroupPayload } from "./create";

export async function update(
  groupId: string,
  payload: CreateGroupPayload,
): Promise<Group> {
  const { data } = await httpClient.put<Group>(`/groups/${groupId}`, payload);
  return data;
}
