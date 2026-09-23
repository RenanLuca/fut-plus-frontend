import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resendVerification } from "@/src/app/services/authService";
import { isRateLimitError, RATE_LIMIT_MESSAGE } from "@/src/app/utils/rate-limit";

export function useResendVerification() {
  const { mutate, isPending } = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success("Se o email existir, enviamos um novo link de verificação.");
    },
    onError: (error) => {
      toast.error(
        isRateLimitError(error)
          ? RATE_LIMIT_MESSAGE
          : "Não foi possível reenviar. Tente novamente.",
      );
    },
  });

  return { resend: mutate, isResending: isPending };
}
