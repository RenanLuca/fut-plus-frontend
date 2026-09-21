import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  position: z.enum(
    ["GOALKEEPER", "DEFENDER", "WINGER", "STRIKER"],
    "Selecione uma posição",
  ),
  telefone: z
    .string()
    .refine(
      (value) => value === "" || /^\d{10,11}$/.test(value),
      "Informe o DDD e o número (10 ou 11 dígitos)",
    ),
  profilePicture: z.union([
    z.literal(""),
    z.url({
      protocol: /^https?$/,
      error: "Informe um link começando com http:// ou https://",
    }),
  ]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
