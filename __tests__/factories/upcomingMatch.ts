import type { UpcomingMatch } from "@/src/app/services/usersService";

export function makeUpcomingMatchMock(
  overrides: Partial<UpcomingMatch> = {},
): UpcomingMatch {
  return {
    group: {
      id: "123",
      name: "Pelada",
      valuePerUser: 20,
    },
    groupId: "123",
    id: "123",
    matchDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
