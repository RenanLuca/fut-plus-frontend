import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from ".";
import {
  useHomeController,
  type UseHomeControllerReturn,
} from "@/src/view/pages/Home/useHomeController";
import { makeGroupsMock } from "@/__tests__/factories/group";
import { makeHomeControllerMock } from "@/__tests__/factories/useHomeControllerMock";
import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { makeUserMock } from "@/__tests__/factories/user";
import { GroupsGrid } from "@/src/view/pages/Groups/components/GroupsGrid";
import { UpcomingMatchCard } from "@/src/view/components/UpcomingMatchCard";
import { GroupFormModal } from "@/src/view/pages/Groups/components/GroupFormModal";

vi.mock("@/src/view/pages/Home/useHomeController", () => ({
  useHomeController: vi.fn(),
}));
vi.mock("@/src/view/pages/Groups/components/GroupFormModal", () => ({
  GroupFormModal: vi.fn(),
}));
vi.mock("@/src/view/pages/Groups/components/GroupsGrid", () => ({
  GroupsGrid: vi.fn(),
}));
vi.mock("@/src/view/components/UpcomingMatchCard", () => ({
  UpcomingMatchCard: vi.fn(() => <h1 aria-label="UpcomingMatchCard"></h1>),
  NoUpcomingMatch: vi.fn(() => <h1 aria-label="NoUpcomingMatch"></h1>),
}));

// React 19 chama o componente com um segundo argumento (undefined) que não importa aqui
const anyReactArg = expect.toSatisfy(() => true);

const queries = {
  loadingSkeleton: () =>
    screen.queryByRole("status", { name: "UpcomingMatchLoading" }),
  matchCard: () => screen.queryByRole("heading", { name: "UpcomingMatchCard" }),
  noMatch: () => screen.queryByRole("heading", { name: "NoUpcomingMatch" }),
};

function renderHomePage(overrides?: Partial<UseHomeControllerReturn>) {
  vi.mocked(useHomeController).mockReturnValue(
    makeHomeControllerMock(overrides),
  );
  return render(<HomePage />);
}

describe("Home Page", () => {
  describe("User", () => {
    it("should greet the user by first name only", () => {
      renderHomePage({ user: makeUserMock({ name: "Renan de Luca" }) });

      expect(screen.getByText("Olá, Renan!")).toBeInTheDocument();
    });
    it("should render a generic greeting when there is no user", () => {
      renderHomePage({ user: undefined });

      expect(screen.queryByText("Olá, Renan!")).not.toBeInTheDocument();
      expect(screen.queryByText("Olá!")).toBeInTheDocument();
    });
  });
  describe("Match", () => {
    it("should render skeleton when UpcomingMatch is loading", () => {
      renderHomePage({ isLoadingUpcomingMatch: true });

      expect(queries.loadingSkeleton()).toBeInTheDocument();
      expect(queries.matchCard()).not.toBeInTheDocument();
      expect(queries.noMatch()).not.toBeInTheDocument();
    });
    it("should render UpcomingMatch card when exists match", () => {
      renderHomePage({ upcomingMatch: makeUpcomingMatchMock() });

      expect(queries.loadingSkeleton()).not.toBeInTheDocument();
      expect(queries.matchCard()).toBeInTheDocument();
      expect(queries.noMatch()).not.toBeInTheDocument();
    });
    it.each([null, undefined])(
      "should render NoUpcomingMatch when match is: %o",
      (upcomingMatch) => {
        renderHomePage({ upcomingMatch });

        expect(queries.loadingSkeleton()).not.toBeInTheDocument();
        expect(queries.noMatch()).toBeInTheDocument();
        expect(queries.matchCard()).not.toBeInTheDocument();
      },
    );
    it("should call UpcomingMatchCard with correct props", () => {
      const match = makeUpcomingMatchMock();

      renderHomePage({ upcomingMatch: match });

      expect(vi.mocked(UpcomingMatchCard)).toHaveBeenLastCalledWith(
        { groupName: match.group.name, match },
        anyReactArg,
      );
    });
  });
  describe("Groups", () => {
    it("should render the groups section title", () => {
      renderHomePage();

      expect(
        screen.getByRole("heading", { level: 2, name: "Meus grupos" }),
      ).toBeInTheDocument();
    });
    it.each([false, true])(
      "should pass groups and loading %o state to GroupsGrid",
      (loading) => {
        const groups = makeGroupsMock();
        renderHomePage({ groups, isLoadingGroups: loading });

        expect(vi.mocked(GroupsGrid)).toHaveBeenLastCalledWith(
          { groups, isLoading: loading },
          anyReactArg,
        );
      },
    );
    it("should call GroupFormModal with correct props", () => {
      renderHomePage();

      expect(vi.mocked(GroupFormModal)).toHaveBeenLastCalledWith(
        { mode: "create" },
        anyReactArg,
      );
    });
  });
});
