import { describe, expect, it } from "vitest";
import { getMatchDateParts } from "./format-match-date";

describe("getMatchDateParts", () => {
  it("should describe the date in Brazil time, in Portuguese", () => {
    // 22:30 UTC = 19:30 em Brasília (UTC-3)
    expect(getMatchDateParts(new Date("2026-10-02T22:30:00Z"))).toEqual({
      weekday: "Sexta-feira",
      day: "02",
      month: "out",
      time: "19:30",
    });
  });

  it("should use the Brazil day when UTC is already on the next day", () => {
    // 02:00 UTC de 1º de março = 23:00 de 28 de fevereiro em Brasília
    expect(getMatchDateParts(new Date("2026-03-01T02:00:00Z"))).toEqual({
      weekday: "Sábado",
      day: "28",
      month: "fev",
      time: "23:00",
    });
  });

  it("should capitalize the weekday and drop the dot of the abbreviated month", () => {
    const { weekday, month } = getMatchDateParts(
      new Date("2026-09-15T15:00:00Z"),
    );

    expect(weekday).toBe("Terça-feira");
    expect(month).toBe("set");
  });
});
