import { httpClient } from "@/src/app/lib/http-client";
import type { Position } from "@/src/app/constants/position";

export type SignupPayload = {
  email: string;
  password: string;
  name: string;
  position: Position;
};

export async function signup(payload: SignupPayload): Promise<void> {
  await httpClient.post("/auth/signup", payload);
}
