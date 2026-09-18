import { httpClient } from "@/src/app/lib/http-client";
import type { Group } from "./findAll";

export async function findOne(groupId: string): Promise<Group> {
  const { data } = await httpClient.get<Group>(`/groups/${groupId}`);
  return data;
}
