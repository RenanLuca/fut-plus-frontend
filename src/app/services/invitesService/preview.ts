import { httpClient } from "@/src/app/lib/http-client";
import type { FrequencyType } from "@/src/app/constants/frequencyType";
import type { Weekday } from "@/src/app/constants/weekday";

export type InvitePreview = {
  id: string;
  alreadyMember: boolean;
  membersCount: number;
  group: {
    id: string;
    name: string;
    weekday: Weekday;
    hour: string;
    frequency: FrequencyType;
    valuePerUser: number;
  };
  owner: { name: string };
};

export async function preview(inviteId: string): Promise<InvitePreview> {
  const { data } = await httpClient.get<InvitePreview>(
    `/invites/${inviteId}`,
  );
  return data;
}
