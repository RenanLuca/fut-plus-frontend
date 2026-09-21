import { httpClient } from "@/src/app/lib/http-client";

export async function removeUser(
  groupId: string,
  userId: string,
): Promise<void> {
  await httpClient.delete(
    `/groups/${groupId}/group-members/user/${userId}`,
  );
}
