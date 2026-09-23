import { httpClient } from "@/src/app/lib/http-client";
import type { Weekday } from "@/src/app/constants/weekday";
import type { FrequencyType } from "@/src/app/constants/frequencyType";
import type { Rank } from "@/src/app/constants/rank";
import type { Group } from "./findAll";

export type CreateGroupPayload = {
  name: string;
  weekday: Weekday;
  hour: string;
  frequency: FrequencyType;
  valuePerUser: number;
  rank: Rank;
};

export async function create(payload: CreateGroupPayload): Promise<Group> {
  const { data } = await httpClient.post<Group>("/groups", payload);
  return data;
}
