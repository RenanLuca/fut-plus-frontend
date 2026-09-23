import { httpClient } from "@/src/app/lib/http-client";

export async function forgotPassword(email: string): Promise<void> {
  await httpClient.post("/auth/forgot-password", { email });
}
