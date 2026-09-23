import { z } from "zod";
import { passwordSchema } from "@/src/app/schemas/password.schema";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe sua senha atual"),
  newPassword: passwordSchema,
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
