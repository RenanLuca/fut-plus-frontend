import { z } from "zod";
import { passwordSchema } from "@/src/app/schemas/password.schema";

export const signupSchema = z
  .object({
    name: z.string().min(1, "Informe o nome"),
    email: z.string().min(1, "Informe o email").email("Email inválido"),
    confirmEmail: z.string().min(1, "Confirme o email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme a senha"),
    position: z.enum(
      ["GOALKEEPER", "DEFENDER", "WINGER", "STRIKER"],
      "Selecione uma posição",
    ),
  })
  .refine(
    (values) =>
      values.email.trim().toLowerCase() ===
      values.confirmEmail.trim().toLowerCase(),
    { path: ["confirmEmail"], message: "Os emails não conferem" },
  )
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
