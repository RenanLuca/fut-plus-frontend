import { z } from "zod";

export const changeEmailSchema = z.object({
  newEmail: z.string().min(1, "Informe o novo email").email("Email inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

export type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;
