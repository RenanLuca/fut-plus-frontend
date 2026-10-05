import { describe, expect, it } from "vitest";
import { formatPhone, onlyPhoneDigits } from "./phone";

describe("onlyPhoneDigits", () => {
  it("should remove everything that is not a digit", () => {
    expect(onlyPhoneDigits("(11) 99999-8888")).toBe("11999998888");
  });

  it("should keep at most 11 digits", () => {
    expect(onlyPhoneDigits("119999988887777")).toBe("11999998888");
  });

  it("should return an empty string when there are no digits", () => {
    expect(onlyPhoneDigits("abc -()")).toBe("");
  });
});

describe("formatPhone", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["119", "(11) 9"],
    ["1199999", "(11) 9999-9"],
    ["1133334444", "(11) 3333-4444"],
    ["11999998888", "(11) 99999-8888"],
  ])("should format '%s' as '%s'", (digits, expected) => {
    expect(formatPhone(digits)).toBe(expected);
  });

  it("should not add the hyphen until the number passes the prefix", () => {
    expect(formatPhone("113333")).toBe("(11) 3333");
  });
});
