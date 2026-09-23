import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Informe o email").email("Email inválido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
