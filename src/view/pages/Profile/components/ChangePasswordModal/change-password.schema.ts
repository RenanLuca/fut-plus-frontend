import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual"),
  newPassword: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
