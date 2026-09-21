import { httpClient } from "@/src/app/lib/http-client";
import type { Group } from "./findAll";

export type TransferOwnershipPayload = {
  newOwnerId: string;
};

export async function transferOwnership(
  groupId: string,
  payload: TransferOwnershipPayload,
): Promise<Group> {
  const { data } = await httpClient.patch<Group>(
    `/groups/${groupId}/transfer-ownership`,
    payload,
  );
  return data;
}
