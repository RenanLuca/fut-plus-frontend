import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";
import { useAuthRedirect } from "@/src/app/hooks/useAuthRedirect";
import { signin as signinRequest } from "@/src/app/services/authService";
import { loginSchema, type LoginFormValues } from "./login.schema";

export function useLoginController() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { redirectTo, withRedirect } = useAuthRedirect();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    mutate: signin,
    isPending,
    error,
  } = useMutation({
    mutationFn: signinRequest,
    onSuccess: ({ accessToken }) => {
      login(accessToken);
      navigate(redirectTo, { replace: true });
    },
  });

  const onSubmit = handleSubmit((values) => {
    signin(values);
  });

  const errorMessage =
    isAxiosError(error) && error.response?.status === 401
      ? "Email ou senha inválidos"
      : error
        ? "Não foi possível entrar. Tente novamente."
        : null;

  return {
    signupLink: withRedirect("/signup"),
    register,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
