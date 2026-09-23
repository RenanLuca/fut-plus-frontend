import { z } from "zod";

export const groupFormSchema = z.object({
  name: z.string().min(1, "Informe o nome do grupo"),
  weekday: z.enum(
    [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ],
    "Selecione o dia da semana",
  ),
  hour: z
    .string()
    .min(1, "Informe o horário")
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"),
  frequency: z.enum(["EVENTUAL", "MONTHLY"], "Selecione a frequência"),
  valuePerUser: z
    .string()
    .min(1, "Informe um valor")
    .refine(
      (value) => Number(value) > 0,
      "Informe um valor válido",
    ),
  rank: z
    .enum(["BRASILEIRAO", "CHAMPIONS_LEAGUE", "BALLON_DOR"])
    .optional(),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;

export const createGroupFormSchema = groupFormSchema.extend({
  rank: z.enum(
    ["BRASILEIRAO", "CHAMPIONS_LEAGUE", "BALLON_DOR"],
    "Selecione seu nível",
  ),
});

export type CreateGroupFormValues = z.infer<typeof createGroupFormSchema>;
