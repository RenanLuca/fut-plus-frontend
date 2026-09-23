import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword as forgotPasswordRequest } from "@/src/app/services/authService";
import {
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "@/src/app/utils/rate-limit";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "./forgot-password.schema";

export function useForgotPasswordController() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    mutate: forgotPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: (_data, email) => {
      setSubmittedEmail(email);
    },
  });

  const onSubmit = handleSubmit(({ email }) => {
    forgotPassword(email);
  });

  const errorMessage = isRateLimitError(error)
    ? RATE_LIMIT_MESSAGE
    : error
      ? "Não foi possível enviar o email. Tente novamente."
      : null;

  return {
    submittedEmail,
    register,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
