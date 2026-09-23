import { httpClient } from "@/src/app/lib/http-client";

export type VerifyEmailResponse = {
  message: string;
};

// Retorna o corpo (e não void) porque é usado como queryFn: o TanStack Query
// trata `undefined` como erro, mesmo com o request tendo dado 200.
export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const { data } = await httpClient.post<VerifyEmailResponse>(
    "/auth/verify-email",
    { token },
  );
  return data;
}
