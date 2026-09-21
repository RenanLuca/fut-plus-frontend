import { httpClient } from "@/src/app/lib/http-client";
import type { GroupPayment } from "./findAllMine";

export type CreateGroupPaymentPayload = {
  amount: number;
  receipt?: string;
  matchId?: string;
};

export async function create(
  groupId: string,
  payload: CreateGroupPaymentPayload,
): Promise<GroupPayment> {
  const { data } = await httpClient.post<GroupPayment>(
    `/groups/${groupId}/group-payments`,
    payload,
  );
  return data;
}
