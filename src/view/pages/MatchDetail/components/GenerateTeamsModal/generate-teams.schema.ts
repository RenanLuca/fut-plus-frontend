import { z } from "zod";

export const generateTeamsSchema = z.object({
  playersPerTeam: z
    .string()
    .min(1, "Informe a quantidade de jogadores por time")
    .refine((value) => Number(value) >= 1, "Precisa de pelo menos 1 jogador por time"),
});

export type GenerateTeamsFormValues = z.infer<typeof generateTeamsSchema>;
