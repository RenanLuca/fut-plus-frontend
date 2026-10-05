import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

// invalidateQueries/removeQueries casam por prefixo: a hierarquia das chaves é o que
// faz "invalidar a partida" também atualizar as presenças e os times dela.
const isPrefixOf = (prefix: readonly unknown[], key: readonly unknown[]) =>
  prefix.length <= key.length && prefix.every((part, index) => key[index] === part);

describe("queryKeys", () => {
  it("should build the keys of a group from the group id", () => {
    expect(queryKeys.group("g1")).toEqual(["groups", "g1"]);
    expect(queryKeys.groupMembers("g1")).toEqual(["groups", "g1", "members"]);
    expect(queryKeys.groupInvite("g1")).toEqual(["groups", "g1", "invite"]);
    expect(queryKeys.groupMatches("g1")).toEqual(["groups", "g1", "matches"]);
  });

  it("should build the keys of a match from the group and match ids", () => {
    expect(queryKeys.groupMatch("g1", "m1")).toEqual(["groups", "g1", "matches", "m1"]);
    expect(queryKeys.matchPresences("g1", "m1")).toEqual([
      "groups",
      "g1",
      "matches",
      "m1",
      "presences",
    ]);
    expect(queryKeys.matchTeams("g1", "m1")).toEqual([
      "groups",
      "g1",
      "matches",
      "m1",
      "teams",
    ]);
  });

  it("should tell the payments of different months and scopes apart", () => {
    expect(queryKeys.myPayments("g1", 2026, 10)).not.toEqual(
      queryKeys.myPayments("g1", 2026, 9),
    );
    expect(queryKeys.myPayments("g1", 2026, 10)).not.toEqual(
      queryKeys.groupPaymentsByMonth("g1", 2026, 10),
    );
  });

  it("should tell two groups apart", () => {
    expect(queryKeys.group("g1")).not.toEqual(queryKeys.group("g2"));
    expect(queryKeys.matchPresences("g1", "m1")).not.toEqual(
      queryKeys.matchPresences("g1", "m2"),
    );
  });

  describe("prefix hierarchy used to invalidate related data", () => {
    it("should make the groups list the root of everything about a group", () => {
      [
        queryKeys.group("g1"),
        queryKeys.groupMembers("g1"),
        queryKeys.groupInvite("g1"),
        queryKeys.groupPayments("g1"),
        queryKeys.groupMatches("g1"),
        queryKeys.matchPresences("g1", "m1"),
      ].forEach((key) => expect(isPrefixOf(queryKeys.groups, key)).toBe(true));
    });

    it("should make a group the parent of its own data only", () => {
      expect(isPrefixOf(queryKeys.group("g1"), queryKeys.groupMembers("g1"))).toBe(true);
      expect(isPrefixOf(queryKeys.group("g1"), queryKeys.groupMembers("g2"))).toBe(false);
    });

    it("should make the match the parent of its presences and teams", () => {
      const match = queryKeys.groupMatch("g1", "m1");

      expect(isPrefixOf(match, queryKeys.matchPresences("g1", "m1"))).toBe(true);
      expect(isPrefixOf(match, queryKeys.matchTeams("g1", "m1"))).toBe(true);
      expect(isPrefixOf(match, queryKeys.matchTeams("g1", "m2"))).toBe(false);
    });

    it("should make the matches list the parent of every match of the group", () => {
      expect(
        isPrefixOf(queryKeys.groupMatches("g1"), queryKeys.groupMatch("g1", "m1")),
      ).toBe(true);
    });

    it("should make the group payments the parent of every kind of payment query", () => {
      const payments = queryKeys.groupPayments("g1");

      expect(isPrefixOf(payments, queryKeys.myPayments("g1", 2026, 10))).toBe(true);
      expect(isPrefixOf(payments, queryKeys.groupPaymentsByMonth("g1", 2026, 10))).toBe(true);
      expect(isPrefixOf(payments, queryKeys.pendingPaymentMatches("g1"))).toBe(true);
    });

    it("should keep the current user and the upcoming match out of the groups tree", () => {
      expect(isPrefixOf(queryKeys.groups, queryKeys.me)).toBe(false);
      expect(isPrefixOf(queryKeys.groups, queryKeys.upcomingMatch)).toBe(false);
      expect(isPrefixOf(queryKeys.groups, queryKeys.invite("i1"))).toBe(false);
    });
  });
});
