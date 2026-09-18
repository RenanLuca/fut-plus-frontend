import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useController, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";
import { signup as signupRequest } from "@/src/app/services/authService";
import { signupSchema, type SignupFormValues } from "./signup.schema";

export function useSignupController() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const {
    mutate: signup,
    isPending,
    error,
  } = useMutation({
    mutationFn: signupRequest,
    onSuccess: ({ accessToken }) => {
      login(accessToken);
      navigate("/home");
    },
  });

  const onSubmit = handleSubmit((values) => {
    signup(values);
  });

  const errorMessage =
    isAxiosError(error) && error.response?.status === 409
      ? "Já existe uma conta com esse email"
      : error
        ? "Não foi possível criar sua conta. Tente novamente."
        : null;

  return {
    register,
    positionField,
    onSubmit,
    errors,
    isPending,
    errorMessage,
  };
}
