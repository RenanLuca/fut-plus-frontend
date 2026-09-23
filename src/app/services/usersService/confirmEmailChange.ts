import { httpClient } from "@/src/app/lib/http-client";
import type { CurrentUser } from "./getMe";

export async function confirmEmailChange(token: string): Promise<CurrentUser> {
  const { data } = await httpClient.post<CurrentUser>(
    "/users/confirm-email-change",
    { token },
  );
  return data;
}
