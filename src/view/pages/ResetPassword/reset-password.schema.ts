import { z } from "zod";
import { passwordSchema } from "@/src/app/schemas/password.schema";

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
