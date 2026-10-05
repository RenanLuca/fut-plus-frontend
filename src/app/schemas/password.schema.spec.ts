import { describe, expect, it } from "vitest";
import { PASSWORD_RULES, passwordSchema } from "./password.schema";

function rule(id: string) {
  const found = PASSWORD_RULES.find((item) => item.id === id);
  if (!found) throw new Error(`rule ${id} not found`);
  return found;
}

describe("PASSWORD_RULES", () => {
  it.each([
    ["length", "Abcdef1!", true],
    ["length", "Abcde1!", false],
    ["uppercase", "abcA", true],
    ["uppercase", "abc1!", false],
    ["number", "abc1", true],
    ["number", "abcA!", false],
    ["symbol", "abc!", true],
    ["symbol", "abc1A", false],
    ["symbol", "abc 1A", false],
  ])("rule '%s' for '%s' should be %s", (id, password, expected) => {
    expect(rule(id).test(password)).toBe(expected);
  });
});

describe("passwordSchema", () => {
  it("should accept a password that follows every rule", () => {
    expect(passwordSchema.safeParse("Senha@123").success).toBe(true);
  });

  it("should ask for the password when it is empty", () => {
    const result = passwordSchema.safeParse("");

    expect(result.error?.issues[0].message).toBe("Informe a senha");
  });

  it.each(["short1!", "semmaiuscula1!", "SemNumero!", "SemSimbolo1"])(
    "should reject '%s' with the strength message",
    (password) => {
      const result = passwordSchema.safeParse(password);

      expect(result.error?.issues[0].message).toBe(
        "A senha deve ter no mínimo 8 caracteres, com maiúscula, número e símbolo",
      );
    },
  );
});
