import { httpClient } from "@/src/app/lib/http-client";
import type { GroupInvite } from "./findByGroup";

export async function regenerate(groupId: string): Promise<GroupInvite> {
  const { data } = await httpClient.post<GroupInvite>(
    `/groups/${groupId}/invite`,
  );
  return data;
}
