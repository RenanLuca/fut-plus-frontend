import { httpClient } from "@/src/app/lib/http-client";

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  accessToken: string;
};

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  const { data } = await httpClient.post<ChangePasswordResponse>(
    "/users/change-password",
    payload,
  );
  return data;
}
