import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().min(1, "Informe o email").email("Email inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
  position: z.enum(
    ["GOALKEEPER", "DEFENDER", "WINGER", "STRIKER"],
    "Selecione uma posição",
  ),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
