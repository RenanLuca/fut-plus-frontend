import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format-currency";

// O Intl separa "R$" do número com um espaço não quebrável (U+00A0)
const normalize = (text: string) =>
  text.replaceAll(String.fromCharCode(160), String.fromCharCode(32));

describe("formatCurrency", () => {
  it.each([
    [0, "R$ 0,00"],
    [20, "R$ 20,00"],
    [1234.5, "R$ 1.234,50"],
    [0.1 + 0.2, "R$ 0,30"],
    [1000000, "R$ 1.000.000,00"],
  ])("should format %d as '%s'", (value, expected) => {
    expect(normalize(formatCurrency(value))).toBe(expected);
  });
});
