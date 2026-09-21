import { isAxiosError } from "axios";
import { httpClient } from "@/src/app/lib/http-client";

export type GroupInvite = {
  id: string;
  groupId: string;
  createdAt: string;
};

export async function findByGroup(
  groupId: string,
): Promise<GroupInvite | null> {
  try {
    const { data } = await httpClient.get<GroupInvite>(
      `/groups/${groupId}/invite`,
    );
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
