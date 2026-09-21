import { z } from "zod";

const registerPaymentBaseSchema = z.object({
  amount: z
    .string()
    .min(1, "Informe o valor pago")
    .refine((value) => Number(value) > 0, "Informe um valor válido"),
  receipt: z.union([z.literal(""), z.url("Informe um link válido")]),
  matchId: z.string().optional(),
});

export function buildRegisterPaymentSchema(requiresMatch: boolean) {
  return registerPaymentBaseSchema.refine(
    (values) => !requiresMatch || !!values.matchId,
    { path: ["matchId"], message: "Selecione a partida" },
  );
}

export type RegisterPaymentFormValues = z.infer<
  typeof registerPaymentBaseSchema
>;
