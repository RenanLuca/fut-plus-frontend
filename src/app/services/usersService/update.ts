import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";
import type { CurrentUser } from "./getMe";

export type UpdateUserPayload = {
  name?: string;
  position?: Position;
  telefone?: string;
  profilePicture?: string;
};

export async function update(payload: UpdateUserPayload): Promise<CurrentUser> {
  const { data } = await httpClient.put<CurrentUser>("/users", payload);
  return data;
}
