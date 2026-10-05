import type { InvitePreview } from "@/src/app/services/invitesService";

export function makeInvitePreviewMock(
  overrides: Partial<InvitePreview> = {},
): InvitePreview {
  return {
    id: "invite-1",
    alreadyMember: false,
    membersCount: 8,
    group: {
      id: "group-1",
      name: "Pelada de sexta",
      weekday: "FRIDAY",
      hour: "20:00",
      frequency: "EVENTUAL",
      valuePerUser: 20,
    },
    owner: { name: "Carlos" },
    ...overrides,
  };
}
