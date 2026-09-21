import { httpClient } from "@/src/app/lib/http-client";

export async function remove(
  groupId: string,
  matchId: string,
  guestUserId: string,
): Promise<void> {
  await httpClient.delete(
    `/groups/${groupId}/group-matches/${matchId}/guests/${guestUserId}`,
  );
}
