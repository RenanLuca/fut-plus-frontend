import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatMonthLong,
  formatMonthName,
  getCurrentBrazilMonth,
  isSameMonth,
  shiftMonth,
} from "./brazil-month";

describe("getCurrentBrazilMonth", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it.each([
    ["2026-03-15T12:00:00Z", { year: 2026, month: 3 }],
    // 02:59 UTC ainda é 23:59 de 31/03 em Brasília
    ["2026-04-01T02:59:00Z", { year: 2026, month: 3 }],
    ["2026-04-01T03:00:00Z", { year: 2026, month: 4 }],
    // 02:00 UTC de 1º de janeiro ainda é 31/12 em Brasília
    ["2026-01-01T02:00:00Z", { year: 2025, month: 12 }],
  ])("should read %s as %o", (now, expected) => {
    vi.setSystemTime(new Date(now));

    expect(getCurrentBrazilMonth()).toEqual(expected);
  });
});

describe("shiftMonth", () => {
  it.each([
    [{ year: 2026, month: 5 }, 0, { year: 2026, month: 5 }],
    [{ year: 2026, month: 5 }, 1, { year: 2026, month: 6 }],
    [{ year: 2026, month: 12 }, 1, { year: 2027, month: 1 }],
    [{ year: 2026, month: 1 }, -1, { year: 2025, month: 12 }],
    [{ year: 2026, month: 5 }, 13, { year: 2027, month: 6 }],
    [{ year: 2026, month: 5 }, -12, { year: 2025, month: 5 }],
    [{ year: 2026, month: 3 }, -15, { year: 2024, month: 12 }],
  ])("should shift %o by %d months to %o", (start, delta, expected) => {
    expect(shiftMonth(start, delta)).toEqual(expected);
  });
});

describe("isSameMonth", () => {
  it("should compare year and month", () => {
    expect(isSameMonth({ year: 2026, month: 5 }, { year: 2026, month: 5 })).toBe(
      true,
    );
    expect(isSameMonth({ year: 2026, month: 5 }, { year: 2026, month: 6 })).toBe(
      false,
    );
    expect(isSameMonth({ year: 2026, month: 5 }, { year: 2025, month: 5 })).toBe(
      false,
    );
  });
});

describe("month names", () => {
  it("should write the month and year in Portuguese", () => {
    expect(formatMonthLong({ year: 2026, month: 3 })).toBe("março de 2026");
  });

  it("should write only the month in Portuguese", () => {
    expect(formatMonthName({ year: 2026, month: 12 })).toBe("dezembro");
  });
});
