import { httpClient } from "@/src/app/lib/http-client";

export async function verifyEmail(token: string): Promise<void> {
  await httpClient.post("/auth/verify-email", { token });
}
