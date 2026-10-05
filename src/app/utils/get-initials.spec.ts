import { describe, expect, it } from "vitest";
import { getInitials } from "./get-initials";

describe("getInitials", () => {
  it.each([
    ["Renan", "R"],
    ["Renan Luca", "RL"],
    ["renan luca", "RL"],
    ["Renan de Luca", "RD"],
    ["  Renan   Luca  ", "RL"],
    ["", ""],
  ])("should turn '%s' into '%s'", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
