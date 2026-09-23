import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { changeEmail as changeEmailRequest } from "@/src/app/services/usersService";
import {
  isRateLimitError,
  RATE_LIMIT_MESSAGE,
} from "@/src/app/utils/rate-limit";
import {
  changeEmailSchema,
  type ChangeEmailFormValues,
} from "./change-email.schema";

export function useChangeEmailController() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const {
    mutate: changeEmail,
    isPending,
    error,
    reset: resetMutation,
  } = useMutation({
    mutationFn: changeEmailRequest,
    onSuccess: () => {
      setOpen(false);
      toast.success("Enviamos um link para o novo email. Confirme por lá.");
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
    changeEmail(values);
  });

  const status = isAxiosError(error) ? error.response?.status : undefined;
  const errorMessage =
    status === 400
      ? "Senha incorreta ou o novo email é igual ao atual."
      : status === 409
        ? "Esse email já está em uso."
        : isRateLimitError(error)
          ? RATE_LIMIT_MESSAGE
          : error
            ? "Não foi possível trocar o email. Tente novamente."
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
