import { z } from "zod";

export const inviteSchema = z.object({
  type: z.enum(["MONTHLY", "DAILY"], "Selecione como você vai jogar"),
  rank: z.enum(
    ["BRASILEIRAO", "CHAMPIONS_LEAGUE", "BALLON_DOR"],
    "Selecione o seu nível",
  ),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
