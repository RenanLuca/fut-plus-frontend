import { describe, expect, it } from "vitest";
import {
  POSITION_OPTIONS,
  POSITION_OPTIONS_BY_VALUE,
  POSITION_ORDER,
} from "./position";
import { RANK_OPTIONS, RANK_OPTIONS_BY_VALUE } from "./rank";
import { WEEKDAY_LABELS, WEEKDAY_OPTIONS } from "./weekday";
import { FREQUENCY_LABELS, FREQUENCY_OPTIONS } from "./frequencyType";
import {
  GROUP_MEMBER_TYPE_LABELS,
  JOINABLE_MEMBER_TYPE_OPTIONS,
} from "./groupMemberType";
import { TEAM_COLOR_OPTIONS, TEAM_COLOR_VALUES } from "./teamColors";

describe("positions", () => {
  it("should order the positions from the goalkeeper to the striker", () => {
    expect(POSITION_ORDER).toEqual({
      GOALKEEPER: 0,
      DEFENDER: 1,
      WINGER: 2,
      STRIKER: 3,
    });
  });

  it("should label every position in Portuguese", () => {
    expect(POSITION_OPTIONS.map((option) => option.label)).toEqual([
      "Goleiro",
      "Zagueiro",
      "Ponta",
      "Atacante",
    ]);
  });

  it("should find an option by its value", () => {
    expect(POSITION_OPTIONS_BY_VALUE.STRIKER.label).toBe("Atacante");
    expect(Object.keys(POSITION_OPTIONS_BY_VALUE)).toHaveLength(POSITION_OPTIONS.length);
  });
});

describe("ranks", () => {
  it("should label every rank in Portuguese", () => {
    expect(RANK_OPTIONS.map((option) => option.label)).toEqual([
      "Brasileirão",
      "Champions League",
      "Bola de Ouro",
    ]);
  });

  it("should find an option by its value", () => {
    expect(RANK_OPTIONS_BY_VALUE.BALLON_DOR.label).toBe("Bola de Ouro");
    expect(Object.keys(RANK_OPTIONS_BY_VALUE)).toHaveLength(RANK_OPTIONS.length);
  });
});

describe("weekdays", () => {
  it("should list the seven days starting on Sunday", () => {
    expect(WEEKDAY_OPTIONS.map((option) => option.value)).toEqual([
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ]);
  });

  it("should use the same labels in the options and in the lookup table", () => {
    WEEKDAY_OPTIONS.forEach((option) =>
      expect(WEEKDAY_LABELS[option.value]).toBe(option.label),
    );
    expect(WEEKDAY_LABELS.FRIDAY).toBe("Sexta");
  });
});

describe("frequencies", () => {
  it("should offer the eventual and monthly frequencies", () => {
    expect(FREQUENCY_OPTIONS).toEqual([
      { value: "EVENTUAL", label: "Eventual" },
      { value: "MONTHLY", label: "Mensal" },
    ]);
    expect(FREQUENCY_LABELS.MONTHLY).toBe("Mensal");
  });
});

describe("group member types", () => {
  it("should label every type in Portuguese", () => {
    expect(GROUP_MEMBER_TYPE_LABELS).toEqual({
      MONTHLY: "Mensalista",
      DAILY: "Diarista",
      OWNER: "Dono",
    });
  });

  it("should never let someone join a group as the owner", () => {
    expect(JOINABLE_MEMBER_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      "MONTHLY",
      "DAILY",
    ]);
  });
});

describe("team colors", () => {
  it("should offer six distinct hex colors", () => {
    expect(TEAM_COLOR_OPTIONS).toHaveLength(6);
    expect(new Set(TEAM_COLOR_VALUES).size).toBe(6);
    TEAM_COLOR_VALUES.forEach((color) => expect(color).toMatch(/^#[0-9A-F]{6}$/));
  });

  it("should expose the values in the same order as the options", () => {
    expect(TEAM_COLOR_VALUES).toEqual(TEAM_COLOR_OPTIONS.map((option) => option.value));
  });
});
