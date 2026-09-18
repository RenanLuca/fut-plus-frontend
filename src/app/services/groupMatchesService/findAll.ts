import { httpClient } from "@/src/app/lib/http-client";

export type GroupMatch = {
  id: string;
  groupId: string;
  matchDate: string;
  createdAt: string;
  updatedAt: string;
};

export async function findAll(groupId: string): Promise<GroupMatch[]> {
  const { data } = await httpClient.get<GroupMatch[]>(
    `/groups/${groupId}/group-matches`,
  );
  return data;
}
