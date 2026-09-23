import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";
import { queryKeys } from "@/src/app/lib/query-keys";
import { confirmEmailChange } from "@/src/app/services/usersService";

export function useConfirmEmailChangeController() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // useQuery pelo mesmo motivo do VerifyEmail: token de uso único + StrictMode.
  const { isSuccess, isError, error } = useQuery({
    queryKey: ["confirm-email-change", token],
    queryFn: () => confirmEmailChange(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    }
  }, [isSuccess, queryClient]);

  const isEmailTaken =
    isAxiosError(error) && error.response?.status === 409;

  return {
    isSuccess,
    isEmailTaken,
    isInvalid: !token || (isError && !isEmailTaken),
    nextLink: isAuthenticated ? "/profile" : "/",
    nextLabel: isAuthenticated ? "Ir para o perfil" : "Ir para o login",
  };
}
