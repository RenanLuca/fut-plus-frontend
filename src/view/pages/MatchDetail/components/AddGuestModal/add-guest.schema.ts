import { z } from "zod";

export const addGuestSchema = z.object({
  name: z.string().min(1, "Informe o nome do convidado"),
  position: z.enum(
    ["GOALKEEPER", "DEFENDER", "WINGER", "STRIKER"],
    "Selecione a posição",
  ),
  rank: z.enum(
    ["BRASILEIRAO", "CHAMPIONS_LEAGUE", "BALLON_DOR"],
    "Selecione o nível",
  ),
});

export type AddGuestFormValues = z.infer<typeof addGuestSchema>;
