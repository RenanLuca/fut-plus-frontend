import { z } from "zod";

export const generateTeamsSchema = z.object({
  teamCount: z
    .string()
    .min(1, "Informe a quantidade de times")
    .refine((value) => Number(value) >= 2, "Precisa de pelo menos 2 times"),
});

export type GenerateTeamsFormValues = z.infer<typeof generateTeamsSchema>;
