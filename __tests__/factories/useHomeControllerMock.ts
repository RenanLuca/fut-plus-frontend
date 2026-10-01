import type { UseHomeControllerReturn } from "@/src/view/pages/Home/useHomeController";
import { makeGroupsMock } from "./group";
import { makeUpcomingMatchMock } from "./upcomingMatch";
import { makeUserMock } from "./user";

export function makeHomeControllerMock(
  overrides?: Partial<UseHomeControllerReturn>,
): UseHomeControllerReturn {
  return {
    user: makeUserMock(),
    isLoadingGroups: false,
    isLoadingUpcomingMatch: false,
    upcomingMatch: makeUpcomingMatchMock(),
    groups: makeGroupsMock(),
    ...overrides,
  };
}
