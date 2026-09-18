import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  position: Position;
};

export type SignupResponse = {
  accessToken: string;
};

export async function signup(
  payload: SignupPayload,
): Promise<SignupResponse> {
  const { data } = await httpClient.post<SignupResponse>(
    "/auth/signup",
    payload,
  );
  return data;
}
