import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES: { id: string; label: string; test: (value: string) => boolean }[] = [
  {
    id: "length",
    label: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "Um número",
    test: (value) => /\d/.test(value),
  },
  {
    id: "symbol",
    label: "Um símbolo (ex: ! @ #)",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
];

// Fonte única da regra de senha nova (signup, reset e troca de senha).
// O login NÃO usa: contas antigas podem ter senha mais fraca.
export const passwordSchema = z
  .string()
  .min(1, "Informe a senha")
  .refine(
    (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
    `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres, com maiúscula, número e símbolo`,
  );
