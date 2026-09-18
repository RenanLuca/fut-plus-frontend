import { httpClient } from "@/src/app/lib/http-client";

export type UpdateMatchPresencePayload = {
  isPresent: boolean;
};

export async function update(
  groupId: string,
  matchId: string,
  payload: UpdateMatchPresencePayload,
): Promise<{ message: string }> {
  const { data } = await httpClient.patch<{ message: string }>(
    `/groups/${groupId}/group-matches/${matchId}/match-presences`,
    payload,
  );
  return data;
}
