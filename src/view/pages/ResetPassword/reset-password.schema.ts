import { z } from "zod";

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
