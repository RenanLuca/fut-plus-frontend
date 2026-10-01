import type { Group } from "@/src/app/services/groupsService";

export function makeGroupMock(overrides: Partial<Group> = {}): Group {
  return {
    createdAt: new Date().toISOString(),
    frequency: "EVENTUAL",
    hour: "20:00",
    id: "123",
    name: "Pelada",
    ownerId: "123",
    updatedAt: new Date().toISOString(),
    valuePerUser: 20,
    weekday: "FRIDAY",
    ...overrides,
  };
}

export function makeGroupsMock(): Group[] {
  return [makeGroupMock()];
}
