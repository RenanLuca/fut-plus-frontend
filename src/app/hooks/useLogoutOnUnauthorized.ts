import { isAxiosError } from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { httpClient } from "@/src/app/lib/http-client";

export function useLogoutOnUnauthorized(logout: () => void) {
  useEffect(() => {
    const interceptorId = httpClient.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          const sentAuthorization = error.config?.headers?.Authorization;
          const currentToken = authTokenStorage.get();

          // Só desloga se o 401 veio de uma request feita com o token ATUAL.
          // Isso ignora o 401 do signin (sem token = senha errada) e requests
          // antigas em voo depois que o token foi trocado (change-password).
          if (currentToken && sentAuthorization === `Bearer ${currentToken}`) {
            logout();
            toast.error("Sua sessão expirou. Entre novamente.");
          }
        }
        return Promise.reject(error);
      },
    );

    return () => httpClient.interceptors.response.eject(interceptorId);
  }, [logout]);
}
