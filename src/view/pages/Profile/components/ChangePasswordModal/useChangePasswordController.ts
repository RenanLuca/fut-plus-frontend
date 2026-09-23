import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/src/app/hooks/useAuth";
import { changePassword as changePasswordRequest } from "@/src/app/services/usersService";
import {
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "@/src/app/utils/rate-limit";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "./change-password.schema";

export function useChangePasswordController() {
  const { login } = useAuth();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const {
    mutate: changePassword,
    isPending,
    error,
    reset: resetMutation,
  } = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: ({ accessToken }) => {
      // Trocar a senha invalida todos os JWT antigos (inclusive o atual),
      // então guardamos o token novo pra sessão continuar valendo.
      login(accessToken);
      setOpen(false);
      toast.success("Senha alterada");
    },
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset();
      resetMutation();
    }
  }

  const onSubmit = handleSubmit((values) => {
    changePassword(values);
  });

  const errorMessage =
    isAxiosError(error) && error.response?.status === 400
      ? "Senha atual incorreta."
      : isRateLimitError(error)
        ? RATE_LIMIT_MESSAGE
        : error
          ? "Não foi possível trocar a senha. Tente novamente."
          : null;

  return {
    open,
    onOpenChange,
    register,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
