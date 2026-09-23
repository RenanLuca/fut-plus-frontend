import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import { resetPassword as resetPasswordRequest } from "@/src/app/services/authService";
import {
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "@/src/app/utils/rate-limit";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "./reset-password.schema";

export function useResetPasswordController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const {
    mutate: resetPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      toast.success("Senha redefinida! Entre com a nova senha.");
      navigate("/", { replace: true });
    },
  });

  const onSubmit = handleSubmit(({ password }) => {
    if (token) resetPassword({ token, password });
  });

  const isInvalidToken =
    !token || (isAxiosError(error) && error.response?.status === 400);

  const errorMessage = isRateLimitError(error)
    ? RATE_LIMIT_MESSAGE
    : error && !isInvalidToken
      ? "Não foi possível redefinir a senha. Tente novamente."
      : null;

  return {
    isInvalidToken,
    register,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
