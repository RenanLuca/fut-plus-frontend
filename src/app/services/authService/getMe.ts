import { httpClient } from "@/src/app/lib/http-client";

export type Position = "GOALKEEPER" | "DEFENDER" | "WINGER" | "STRIKER";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  telefone: string | null;
  position: Position;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getMe(): Promise<CurrentUser> {
  const { data } = await httpClient.get<CurrentUser>("/users/me");
  return data;
}
