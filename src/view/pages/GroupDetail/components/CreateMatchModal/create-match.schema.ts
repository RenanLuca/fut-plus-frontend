import { z } from "zod";

export const createMatchSchema = z.object({
  matchDate: z.string().min(1, "Informe a data e o horário"),
});

export type CreateMatchFormValues = z.infer<typeof createMatchSchema>;
