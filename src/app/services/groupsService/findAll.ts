import { httpClient } from "@/src/app/lib/http-client";
import type { Weekday } from "@/src/app/constants/weekday";
import type { FrequencyType } from "@/src/app/constants/frequencyType";

export type Group = {
  id: string;
  name: string;
  ownerId: string;
  weekday: Weekday;
  hour: string;
  frequency: FrequencyType;
  valuePerUser: number;
  createdAt: string;
  updatedAt: string;
};

export async function findAll(): Promise<Group[]> {
  const { data } = await httpClient.get<Group[]>("/groups");
  return data;
}
