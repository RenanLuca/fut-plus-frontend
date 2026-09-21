import { httpClient } from "@/src/app/lib/http-client";
import type { Rank } from "@/src/app/constants/rank";

export type AcceptInvitePayload = {
  type: "MONTHLY" | "DAILY";
  rank: Rank;
};

export type AcceptedInvite = {
  id: string;
  groupId: string;
  userId: string;
  type: "MONTHLY" | "DAILY";
  rank: Rank;
};

export async function accept(
  inviteId: string,
  payload: AcceptInvitePayload,
): Promise<AcceptedInvite> {
  const { data } = await httpClient.post<AcceptedInvite>(
    `/invites/${inviteId}/accept`,
    payload,
  );
  return data;
}
