import type {
  MatchPresenceMember,
  MatchPresences,
} from "@/src/app/services/matchPresencesService";
import { makeUserMock } from "./user";

function makeMemberMock(
  overrides: Partial<MatchPresenceMember> = {},
): MatchPresenceMember {
  return {
    id: "member",
    isGuest: false,
    name: "Renan",
    position: "DEFENDER",
    profilePicture: null,
    rank: "BALLON_DOR",
    ...overrides,
  };
}

export function makeMatchPresencesMock({
  confirmeds = 10,
  withLoggedUser = false,
}: {
  confirmeds?: number;
  withLoggedUser?: boolean | "confirmed" | "declined";
} = {}): MatchPresences {
  const presences: MatchPresences = {
    confirmed: Array.from({ length: confirmeds }, (_, index) =>
      makeMemberMock({ id: `member-${index}` }),
    ),
    declined: [],
    pending: [],
  };

  if (withLoggedUser) {
    const { id, name } = makeUserMock();
    const list = withLoggedUser === true ? "confirmed" : withLoggedUser;
    presences[list][0] = makeMemberMock({ id, name });
  }

  return presences;
}
