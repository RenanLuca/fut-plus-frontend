import { httpClient } from "@/src/app/lib/http-client";

export type SigninPayload = {
  email: string;
  password: string;
};

export type SigninResponse = {
  accessToken: string;
};

export async function signin(
  payload: SigninPayload,
): Promise<SigninResponse> {
  const { data } = await httpClient.post<SigninResponse>(
    "/auth/signin",
    payload,
  );
  return data;
}
