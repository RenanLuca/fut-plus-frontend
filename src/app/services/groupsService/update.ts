import { httpClient } from "@/src/app/lib/http-client";
import type { Group } from "./findAll";
import type { CreateGroupPayload } from "./create";

export type UpdateGroupPayload = Omit<CreateGroupPayload, "rank">;

export async function update(
  groupId: string,
  payload: UpdateGroupPayload,
): Promise<Group> {
  const { data } = await httpClient.put<Group>(`/groups/${groupId}`, payload);
  return data;
}
