import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  telefone: string | null;
  position: Position;
  profilePicture: string | null;
  emailVerifiedAt: string | null;
  emailNotifications: boolean;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getMe(): Promise<CurrentUser> {
  const { data } = await httpClient.get<CurrentUser>("/users/me");
  return data;
}
