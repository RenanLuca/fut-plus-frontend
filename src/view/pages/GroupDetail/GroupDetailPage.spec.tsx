import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { GroupDetailPage } from "@/src/view/pages/GroupDetail";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { makeMatchPresencesMock } from "@/__tests__/factories/matchPresences";
import { API_URL, presencesUrl } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString();

function makeMatch(id: string, matchDate: string) {
  return makeUpcomingMatchMock({ id, groupId: "group-1", matchDate });
}

function mockGroupDetail({
  group = {},
  matches = [],
  matchesDelay = 0,
}: {
  group?: Parameters<typeof makeGroupMock>[0];
  matches?: ReturnType<typeof makeMatch>[];
  matchesDelay?: number;
} = {}) {
  server.use(
    http.get(`${API_URL}/groups/group-1`, () =>
      HttpResponse.json(
        makeGroupMock({
          id: "group-1",
          name: "Pelada de sexta",
          ownerId: "user-logado",
          frequency: "EVENTUAL",
          ...group,
        }),
      ),
    ),
    http.get(`${API_URL}/groups/group-1/group-matches`, async () => {
      await delay(matchesDelay);
      return HttpResponse.json(matches);
    }),
    http.get(presencesUrl("group-1", "next"), () =>
      HttpResponse.json(makeMatchPresencesMock()),
    ),
    http.get(presencesUrl("group-1", "later"), () =>
      HttpResponse.json(makeMatchPresencesMock()),
    ),
  );
}

function renderGroupDetailPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/groups/:groupId" element={<GroupDetailPage />} />
    </Routes>,
    { route: "/groups/group-1" },
  );
}

describe("GroupDetail Page", () => {
  it("should render nothing until the group is loaded", async () => {
    server.use(
      http.get(`${API_URL}/groups/group-1`, async () => {
        await delay(100);
        return HttpResponse.json(makeGroupMock({ id: "group-1" }));
      }),
      http.get(`${API_URL}/groups/group-1/group-matches`, () =>
        HttpResponse.json([]),
      ),
    );

    renderGroupDetailPage();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Próxima partida" }),
    ).toBeInTheDocument();
  });

  describe("next match", () => {
    it("should show the closest upcoming match of the group", async () => {
      mockGroupDetail({
        matches: [makeMatch("later", inDays(10)), makeMatch("next", inDays(2))],
      });

      renderGroupDetailPage();

      expect(
        await screen.findByRole("link", { name: /Pelada de sexta/ }),
      ).toHaveAttribute("href", "/groups/group-1/matches/next");
      expect(
        screen.queryByText("Nenhuma partida marcada"),
      ).not.toBeInTheDocument();
    });

    it("should ignore matches that already happened", async () => {
      mockGroupDetail({
        matches: [makeMatch("old", inDays(-3)), makeMatch("next", inDays(4))],
      });

      renderGroupDetailPage();

      expect(
        await screen.findByRole("link", { name: /Pelada de sexta/ }),
      ).toHaveAttribute("href", "/groups/group-1/matches/next");
    });

    it("should show a placeholder instead of the empty state while the matches load", async () => {
      mockGroupDetail({ matchesDelay: 100, matches: [makeMatch("next", inDays(2))] });

      renderGroupDetailPage();

      expect(
        await screen.findByRole("heading", { name: "Próxima partida" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Nenhuma partida marcada")).not.toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: /Pelada de sexta/ }),
      ).toBeInTheDocument();
    });
  });

  describe("without an upcoming match", () => {
    it("should tell the owner of an eventual group to create one", async () => {
      mockGroupDetail();

      renderGroupDetailPage();

      expect(await screen.findByText("Nenhuma partida marcada")).toBeInTheDocument();
      expect(screen.getByText("Crie uma partida pra começar")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Criar partida" }),
      ).toBeInTheDocument();
    });

    it("should tell a regular member of an eventual group to wait for the owner", async () => {
      mockGroupDetail({ group: { ownerId: "someone-else" } });

      renderGroupDetailPage();

      expect(
        await screen.findByText("O dono do grupo ainda não marcou a próxima"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Criar partida" }),
      ).not.toBeInTheDocument();
    });

    it("should explain that monthly matches are generated automatically, even for the owner", async () => {
      mockGroupDetail({ group: { frequency: "MONTHLY" } });

      renderGroupDetailPage();

      expect(
        await screen.findByText(
          "As partidas mensais são geradas automaticamente 5 dias antes",
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Criar partida" }),
      ).not.toBeInTheDocument();
    });

    it("should treat a list with only past matches as empty", async () => {
      mockGroupDetail({ matches: [makeMatch("old", inDays(-5))] });

      renderGroupDetailPage();

      expect(await screen.findByText("Nenhuma partida marcada")).toBeInTheDocument();
    });
  });
});
