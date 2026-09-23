import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import { verifyEmail } from "@/src/app/services/authService";

export function useVerifyEmailController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // useQuery (e não useMutation + useEffect) porque o token é de uso único:
  // no StrictMode o effect roda 2x e a 2ª chamada falharia com 400. A query
  // é deduplicada pela queryKey, então a API só recebe uma chamada.
  const { isSuccess, isError } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => verifyEmail(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Email confirmado! Agora é só entrar.");
      navigate("/", { replace: true });
    }
  }, [isSuccess, navigate]);

  return {
    isInvalid: !token || isError,
  };
}
