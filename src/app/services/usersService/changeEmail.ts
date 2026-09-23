import { httpClient } from "@/src/app/lib/http-client";

export type ChangeEmailPayload = {
  newEmail: string;
  password: string;
};

export async function changeEmail(payload: ChangeEmailPayload): Promise<void> {
  await httpClient.post("/users/change-email", payload);
}
