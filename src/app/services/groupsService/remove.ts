import { httpClient } from "@/src/app/lib/http-client";

export async function remove(groupId: string): Promise<void> {
  await httpClient.delete(`/groups/${groupId}`);
}
