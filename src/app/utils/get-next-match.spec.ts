import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupMatch } from "@/src/app/services/groupMatchesService";
import { getNextMatch } from "./get-next-match";

function makeMatch(id: string, matchDate: string): GroupMatch {
  return {
    id,
    groupId: "group-1",
    matchDate,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
}

describe("getNextMatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-05T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("should return undefined when there are no matches", () => {
    expect(getNextMatch([])).toBeUndefined();
  });

  it("should ignore matches that already happened", () => {
    const past = makeMatch("past", "2026-10-04T20:00:00Z");

    expect(getNextMatch([past])).toBeUndefined();
  });

  it("should return the closest future match regardless of the order", () => {
    const later = makeMatch("later", "2026-10-20T20:00:00Z");
    const soon = makeMatch("soon", "2026-10-07T20:00:00Z");
    const past = makeMatch("past", "2026-10-01T20:00:00Z");

    expect(getNextMatch([later, past, soon])?.id).toBe("soon");
  });

  it("should count a match that starts right now as upcoming", () => {
    const now = makeMatch("now", "2026-10-05T12:00:00Z");

    expect(getNextMatch([now])?.id).toBe("now");
  });

  it("should not reorder the array it receives", () => {
    const later = makeMatch("later", "2026-10-20T20:00:00Z");
    const soon = makeMatch("soon", "2026-10-07T20:00:00Z");
    const matches = [later, soon];

    getNextMatch(matches);

    expect(matches.map((match) => match.id)).toEqual(["later", "soon"]);
  });
});
