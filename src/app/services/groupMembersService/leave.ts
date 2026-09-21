import { httpClient } from "@/src/app/lib/http-client";

export async function leave(groupId: string): Promise<void> {
  await httpClient.delete(`/groups/${groupId}/group-members/leave`);
}
