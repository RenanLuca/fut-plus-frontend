export const queryKeys = {
  me: ["me"] as const,
  groups: ["groups"] as const,
  group: (groupId: string) => ["groups", groupId] as const,
  groupMembers: (groupId: string) =>
    ["groups", groupId, "members"] as const,
  groupInvite: (groupId: string) =>
    ["groups", groupId, "invite"] as const,
  invite: (inviteId: string) => ["invites", inviteId] as const,
  groupPayments: (groupId: string) =>
    ["groups", groupId, "payments"] as const,
  myPayments: (groupId: string, year: number, month: number) =>
    ["groups", groupId, "payments", "me", year, month] as const,
  groupPaymentsByMonth: (groupId: string, year: number, month: number) =>
    ["groups", groupId, "payments", "group", year, month] as const,
  pendingPaymentMatches: (groupId: string) =>
    ["groups", groupId, "payments", "pending-matches"] as const,
  groupMatches: (groupId: string) =>
    ["groups", groupId, "matches"] as const,
  groupMatch: (groupId: string, matchId: string) =>
    ["groups", groupId, "matches", matchId] as const,
  upcomingMatch: ["upcomingMatch"] as const,
  matchPresences: (groupId: string, matchId: string) =>
    ["groups", groupId, "matches", matchId, "presences"] as const,
  matchTeams: (groupId: string, matchId: string) =>
    ["groups", groupId, "matches", matchId, "teams"] as const,
};
