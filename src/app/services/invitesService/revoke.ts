import { httpClient } from "@/src/app/lib/http-client";

export async function revoke(groupId: string): Promise<void> {
  await httpClient.delete(`/groups/${groupId}/invite`);
}
