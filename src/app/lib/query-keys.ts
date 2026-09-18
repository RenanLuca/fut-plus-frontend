export const queryKeys = {
  groups: ["groups"] as const,
  group: (groupId: string) => ["groups", groupId] as const,
  groupMembers: (groupId: string) =>
    ["groups", groupId, "members"] as const,
  groupMatches: (groupId: string) =>
    ["groups", groupId, "matches"] as const,
  upcomingMatch: ["upcomingMatch"] as const,
  matchPresences: (groupId: string, matchId: string) =>
    ["groups", groupId, "matches", matchId, "presences"] as const,
};
