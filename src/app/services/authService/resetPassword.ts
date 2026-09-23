import { httpClient } from "@/src/app/lib/http-client";

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  await httpClient.post("/auth/reset-password", payload);
}
