import { z } from "zod";
import { TEAM_COLOR_VALUES } from "@/src/app/constants/teamColors";

export const editTeamSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do time"),
  color: z.enum(TEAM_COLOR_VALUES, "Escolha a cor do time"),
});

export type EditTeamFormValues = z.infer<typeof editTeamSchema>;
