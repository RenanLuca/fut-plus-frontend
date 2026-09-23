import { httpClient } from "@/src/app/lib/http-client";

export async function resendVerification(email: string): Promise<void> {
  await httpClient.post("/auth/resend-verification", { email });
}
