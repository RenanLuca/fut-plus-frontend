import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { useAuthRedirect } from "@/src/app/hooks/useAuthRedirect";
import { useResendVerification } from "@/src/app/hooks/useResendVerification";
import { signup as signupRequest } from "@/src/app/services/authService";
import {
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "@/src/app/utils/rate-limit";
import { signupSchema, type SignupFormValues } from "./signup.schema";

export function useSignupController() {
  const { withRedirect } = useAuthRedirect();
  const { resend, isResending } = useResendVerification();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const { field: positionField } = useController({
    name: "position",
    control,
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  const {
    mutate: signup,
    isPending,
    error,
  } = useMutation({
    mutationFn: signupRequest,
    onSuccess: (_data, values) => {
      setSubmittedEmail(values.email);
    },
  });

  const onSubmit = handleSubmit((values) => {
    // Os campos de confirmação existem só no front, não vão pra API.
    signup({
      name: values.name,
      email: values.email,
      password: values.password,
      position: values.position,
    });
  });

  function onResend() {
    if (submittedEmail) resend(submittedEmail);
  }

  const errorMessage =
    isAxiosError(error) && error.response?.status === 409
      ? "Já existe uma conta com esse email"
      : isRateLimitError(error)
        ? RATE_LIMIT_MESSAGE
        : error
          ? "Não foi possível criar sua conta. Tente novamente."
          : null;

  return {
    submittedEmail,
    onResend,
    isResending,
    loginLink: withRedirect("/"),
    register,
    positionField,
    password,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
