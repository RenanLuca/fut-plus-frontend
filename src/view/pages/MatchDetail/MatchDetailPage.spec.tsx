import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { MatchDetailPage } from "@/src/view/pages/MatchDetail";
import type { MatchPresences } from "@/src/app/services/matchPresencesService";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeMemberMock } from "@/__tests__/factories/matchPresences";
import { makeTeamMock } from "@/__tests__/factories/matchTeam";
import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { API_URL, presencesUrl } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const matchBase = `${API_URL}/groups/group-1/group-matches/match-1`;

const renan = makeMemberMock({
  id: "user-logado",
  name: "Renan Luca",
  position: "STRIKER",
  rank: "BALLON_DOR",
});
const carlos = makeMemberMock({
  id: "user-2",
  name: "Carlos",
  position: "GOALKEEPER",
  rank: "BRASILEIRAO",
});
const visitante = makeMemberMock({
  id: "guest-1",
  name: "Visitante",
  position: "WINGER",
  rank: "CHAMPIONS_LEAGUE",
  isGuest: true,
});
const ana = makeMemberMock({ id: "user-3", name: "Ana Souza", position: "DEFENDER" });
const bruno = makeMemberMock({ id: "user-4", name: "Bruno", position: "DEFENDER" });

const defaultPresences: MatchPresences = {
  confirmed: [renan, carlos, visitante],
  pending: [ana],
  declined: [bruno],
};

type Backend = { presences: MatchPresences; teams: MatchTeam[] };

function mockBackend({
  ownerId = "user-logado",
  presences = defaultPresences,
  teams = [] as MatchTeam[],
  matchDelay = 0,
  teamsDelay = 0,
}: {
  ownerId?: string;
  presences?: MatchPresences;
  teams?: MatchTeam[];
  matchDelay?: number;
  teamsDelay?: number;
} = {}): Backend {
  const state: Backend = { presences, teams };
  server.use(
    http.get(`${API_URL}/groups/group-1`, () =>
      HttpResponse.json(makeGroupMock({ id: "group-1", name: "Pelada de sexta", ownerId })),
    ),
    http.get(matchBase, async () => {
      await delay(matchDelay);
      return HttpResponse.json(
        makeUpcomingMatchMock({
          id: "match-1",
          groupId: "group-1",
          matchDate: "2026-10-02T22:30:00.000Z",
        }),
      );
    }),
    http.get(presencesUrl("group-1", "match-1"), () =>
      HttpResponse.json(state.presences),
    ),
    http.get(`${matchBase}/match-teams`, async () => {
      await delay(teamsDelay);
      return HttpResponse.json(state.teams);
    }),
  );
  return state;
}

function renderMatchDetail() {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <Routes>
      <Route path="/groups/:groupId/matches/:matchId" element={<MatchDetailPage />} />
      <Route path="/groups/:groupId" element={<p>group page</p>} />
    </Routes>,
    { route: "/groups/group-1/matches/match-1" },
  );
  return { user, queryClient };
}

const sectionOf = (title: RegExp) =>
  screen.getByRole("heading", { name: title }).closest("section") as HTMLElement;
const teamCardOf = (name: string) =>
  screen.getByText(name).closest("div.rounded-xl") as HTMLElement;

describe("MatchDetail Page", () => {
  describe("header", () => {
    it("should show only a placeholder until the match is loaded", async () => {
      mockBackend({ matchDelay: 100 });

      renderMatchDetail();

      expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
      expect(
        await screen.findByRole("heading", { level: 1, name: "Sexta-feira · 19:30" }),
      ).toBeInTheDocument();
    });

    it("should show the match day, time and the group name", async () => {
      mockBackend();

      renderMatchDetail();

      expect(
        await screen.findByRole("heading", { name: "Sexta-feira · 19:30" }),
      ).toBeInTheDocument();
      expect(await screen.findByText("Pelada de sexta")).toBeInTheDocument();
      expect(screen.getByText("02").closest("time")).toHaveAttribute(
        "datetime",
        "2026-10-02T22:30:00.000Z",
      );
    });
  });

  describe("presence sections", () => {
    it("should count and list confirmed, pending and declined players", async () => {
      mockBackend();

      renderMatchDetail();

      expect(
        await screen.findByRole("heading", { name: "Confirmados (3)" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Pendentes (1)" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Ausentes (1)" })).toBeInTheDocument();
      expect(within(sectionOf(/Pendentes/)).getByText("Ana Souza")).toBeInTheDocument();
      expect(within(sectionOf(/Ausentes/)).getByText("Bruno")).toBeInTheDocument();
    });

    it("should show a friendly message in each empty section", async () => {
      mockBackend({ presences: { confirmed: [], pending: [], declined: [] } });

      renderMatchDetail();

      expect(await screen.findByText("Ninguém confirmou ainda")).toBeInTheDocument();
      expect(screen.getByText("Todo mundo já respondeu")).toBeInTheDocument();
      expect(screen.getByText("Ninguém avisou que vai faltar")).toBeInTheDocument();
    });

    it("should order each section by position", async () => {
      mockBackend();

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Confirmados (3)" });
      const names = within(sectionOf(/Confirmados/))
        .getAllByText(/^(Carlos|Visitante|Renan Luca)$/)
        .map((element) => element.textContent);
      // goleiro, ponta, atacante
      expect(names).toEqual(["Carlos", "Visitante", "Renan Luca"]);
    });

    it("should show each player's position, level and whether they are a guest", async () => {
      mockBackend();

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Confirmados (3)" });
      const confirmed = sectionOf(/Confirmados/);
      expect(within(confirmed).getByText("Goleiro")).toBeInTheDocument();
      expect(within(confirmed).getByText("Brasileirão")).toBeInTheDocument();
      expect(within(confirmed).getByText("Ponta")).toBeInTheDocument();
      expect(within(confirmed).getByText("Champions League")).toBeInTheDocument();
      expect(within(confirmed).getByText("Atacante")).toBeInTheDocument();
      expect(within(confirmed).getByText("Bola de Ouro")).toBeInTheDocument();
      const guestRow = screen.getByText("Visitante").closest("div.rounded-lg") as HTMLElement;
      expect(within(guestRow).getByText("Convidado")).toBeInTheDocument();
      const memberRow = screen.getByText("Carlos").closest("div.rounded-lg") as HTMLElement;
      expect(within(memberRow).queryByText("Convidado")).not.toBeInTheDocument();
    });

    it("should show a placeholder while the presences load", async () => {
      mockBackend();
      server.use(
        http.get(presencesUrl("group-1", "match-1"), async () => {
          await delay(100);
          return HttpResponse.json(defaultPresences);
        }),
      );

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Sexta-feira · 19:30" });
      expect(screen.queryByRole("heading", { name: /Confirmados/ })).not.toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Confirmados (3)" })).toBeInTheDocument();
    });
  });

  describe("answering presence", () => {
    it("should confirm the user and move them to the confirmed section", async () => {
      const state = mockBackend({
        presences: { confirmed: [carlos], pending: [renan], declined: [] },
      });
      const onUpdate = vi.fn();
      server.use(
        http.patch(presencesUrl("group-1", "match-1"), async ({ request }) => {
          onUpdate(await request.json());
          state.presences = { confirmed: [carlos, renan], pending: [], declined: [] };
          return HttpResponse.json({ message: "ok" });
        }),
      );
      const { user } = renderMatchDetail();
      expect(await screen.findByRole("heading", { name: "Confirmados (1)" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Vou" }));

      expect(await screen.findByText("Presença confirmada!")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({ isPresent: true });
      expect(await screen.findByRole("heading", { name: "Confirmados (2)" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Pendentes (0)" })).toBeInTheDocument();
    });

    it("should decline the user and move them to the absent section", async () => {
      const state = mockBackend({
        presences: { confirmed: [carlos], pending: [renan], declined: [] },
      });
      const onUpdate = vi.fn();
      server.use(
        http.patch(presencesUrl("group-1", "match-1"), async ({ request }) => {
          onUpdate(await request.json());
          state.presences = { confirmed: [carlos], pending: [], declined: [renan] };
          return HttpResponse.json({ message: "ok" });
        }),
      );
      const { user } = renderMatchDetail();
      await screen.findByRole("heading", { name: "Confirmados (1)" });

      await user.click(screen.getByRole("button", { name: "Não vou" }));

      expect(await screen.findByText("Presença recusada")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({ isPresent: false });
      expect(await screen.findByRole("heading", { name: "Ausentes (1)" })).toBeInTheDocument();
    });
  });

  describe("who sees what", () => {
    it("should give the owner the management tools", async () => {
      mockBackend({ ownerId: "user-logado" });

      renderMatchDetail();

      expect(
        await screen.findByRole("button", { name: "Ações da partida" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Convidado" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gerar times" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remover Visitante" })).toBeInTheDocument();
      expect(
        screen.queryByText("Só o dono do grupo pode gerar os times"),
      ).not.toBeInTheDocument();
    });

    it("should hide every management tool from a regular member", async () => {
      mockBackend({ ownerId: "someone-else" });

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Confirmados (3)" });
      expect(
        screen.queryByRole("button", { name: "Ações da partida" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Convidado" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Gerar times" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Remover/ })).not.toBeInTheDocument();
      expect(
        await screen.findByText("Só o dono do grupo pode gerar os times"),
      ).toBeInTheDocument();
    });

    it("should only let the owner remove guests, not regular members", async () => {
      mockBackend();

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Confirmados (3)" });
      expect(screen.getAllByRole("button", { name: /^Remover/ })).toHaveLength(1);
      expect(screen.queryByRole("button", { name: "Remover Carlos" })).not.toBeInTheDocument();
    });
  });

  describe("removing a guest", () => {
    it("should ask for confirmation naming the guest", async () => {
      mockBackend();
      const { user } = renderMatchDetail();

      await user.click(await screen.findByRole("button", { name: "Remover Visitante" }));

      const dialog = await screen.findByRole("alertdialog", { name: "Remover convidado?" });
      expect(
        within(dialog).getByText(
          "Visitante será removido desta partida, inclusive do time em que estiver.",
        ),
      ).toBeInTheDocument();
    });

    it("should remove the guest and refresh the lists", async () => {
      const state = mockBackend();
      const onRemove = vi.fn();
      server.use(
        http.delete(`${matchBase}/guests/guest-1`, () => {
          onRemove();
          state.presences = {
            ...state.presences,
            confirmed: state.presences.confirmed.filter((member) => member.id !== "guest-1"),
          };
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user } = renderMatchDetail();
      await user.click(await screen.findByRole("button", { name: "Remover Visitante" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Remover" }));

      expect(await screen.findByText("Convidado removido")).toBeInTheDocument();
      expect(onRemove).toHaveBeenCalledOnce();
      expect(await screen.findByRole("heading", { name: "Confirmados (2)" })).toBeInTheDocument();
      expect(screen.queryByText("Visitante")).not.toBeInTheDocument();
    });

    it("should keep the guest when the user cancels", async () => {
      mockBackend();
      const onRemove = vi.fn();
      server.use(
        http.delete(`${matchBase}/guests/guest-1`, () => {
          onRemove();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const { user } = renderMatchDetail();
      await user.click(await screen.findByRole("button", { name: "Remover Visitante" }));

      await user.click(await screen.findByRole("button", { name: "Cancelar" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText("Visitante")).toBeInTheDocument();
    });

    it("should show an error toast when the API fails", async () => {
      mockBackend();
      server.use(
        http.delete(`${matchBase}/guests/guest-1`, () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      );
      const { user } = renderMatchDetail();
      await user.click(await screen.findByRole("button", { name: "Remover Visitante" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Remover" }));

      expect(
        await screen.findByText("Não foi possível remover o convidado. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.getByText("Visitante")).toBeInTheDocument();
    });
  });

  describe("teams", () => {
    const teamA = makeTeamMock({
      id: "team-a",
      name: "Time A",
      color: "#FF0000",
      players: [{ id: "user-2", name: "Carlos", position: "GOALKEEPER" }],
    });
    const teamB = makeTeamMock({
      id: "team-b",
      name: "Time B",
      color: "#0000FF",
      players: [{ id: "guest-1", name: "Visitante", isGuest: true, position: "WINGER" }],
    });

    it("should show a placeholder while the teams load", async () => {
      mockBackend({ teamsDelay: 100, teams: [teamA, teamB] });

      renderMatchDetail();

      await screen.findByRole("heading", { name: "Times" });
      expect(screen.queryByText("Nenhum time gerado ainda")).not.toBeInTheDocument();
      expect(await screen.findByText("Time A")).toBeInTheDocument();
    });

    it("should say no team was generated yet", async () => {
      mockBackend();

      renderMatchDetail();

      expect(await screen.findByText("Nenhum time gerado ainda")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gerar times" })).toBeInTheDocument();
    });

    it("should show each team with its players and offer to generate again", async () => {
      mockBackend({ teams: [teamA, teamB] });

      renderMatchDetail();

      expect(await screen.findByText("Time A")).toBeInTheDocument();
      expect(within(teamCardOf("Time A")).getByText("Carlos")).toBeInTheDocument();
      expect(within(teamCardOf("Time B")).getByText("Visitante")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gerar novamente" })).toBeInTheDocument();
      expect(screen.queryByText("Nenhum time gerado ainda")).not.toBeInTheDocument();
    });

    it("should list the confirmed players that are in no team", async () => {
      mockBackend({ teams: [teamA, teamB] });

      renderMatchDetail();

      expect(await screen.findByText("Sem time (1)")).toBeInTheDocument();
      const unassigned = screen.getByText("Sem time (1)").closest("div.rounded-xl") as HTMLElement;
      expect(within(unassigned).getByText("Renan Luca")).toBeInTheDocument();
    });

    it("should not show the unassigned box when every confirmed player has a team", async () => {
      const everyoneAssigned = makeTeamMock({
        id: "team-a",
        name: "Time A",
        players: [
          { id: "user-logado", name: "Renan Luca" },
          { id: "user-2", name: "Carlos" },
          { id: "guest-1", name: "Visitante", isGuest: true },
        ],
      });
      mockBackend({ teams: [everyoneAssigned, teamB] });

      renderMatchDetail();

      await screen.findByText("Time A");
      expect(screen.queryByText(/Sem time/)).not.toBeInTheDocument();
    });

    it("should tell the owner how to move players", async () => {
      mockBackend({ teams: [teamA, teamB] });

      renderMatchDetail();

      expect(
        await screen.findByText("Toque em um jogador para movê-lo de time."),
      ).toBeInTheDocument();
    });

    it("should not tell a regular member to move players", async () => {
      mockBackend({ teams: [teamA, teamB], ownerId: "someone-else" });

      renderMatchDetail();

      await screen.findByText("Time A");
      expect(
        screen.queryByText("Toque em um jogador para movê-lo de time."),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Editar Time/ })).not.toBeInTheDocument();
    });

    it("should pass the confirmed count to the team generator", async () => {
      mockBackend();
      const { user } = renderMatchDetail();

      await user.click(await screen.findByRole("button", { name: "Gerar times" }));

      expect(
        await screen.findByText("Com 3 confirmados, o máximo é 1 jogador por time"),
      ).toBeInTheDocument();
    });
  });

  describe("moving players between teams", () => {
    const teamA = makeTeamMock({
      id: "team-a",
      name: "Time A",
      players: [{ id: "user-2", name: "Carlos", position: "GOALKEEPER" }],
    });
    const teamB = makeTeamMock({
      id: "team-b",
      name: "Time B",
      players: [{ id: "guest-1", name: "Visitante", isGuest: true, position: "WINGER" }],
    });

    function mockRoster(state: Backend, { status = 204, responseDelay = 0 } = {}) {
      const onReplace = vi.fn();
      server.use(
        http.put(`${matchBase}/match-team-players`, async ({ request }) => {
          await delay(responseDelay);
          const roster = (await request.json()) as {
            matchTeamId: string;
            players: ({ userId: string } | { guestUserId: string })[];
          }[];
          onReplace(roster);
          if (status === 204) {
            const all = [...teamA.matchTeamPlayers, ...teamB.matchTeamPlayers];
            state.teams = state.teams.map((team) => ({
              ...team,
              matchTeamPlayers: (
                roster.find((entry) => entry.matchTeamId === team.id)?.players ?? []
              ).map(
                (player) =>
                  all.find((candidate) =>
                    "userId" in player
                      ? candidate.user?.id === player.userId
                      : candidate.guestUser?.id === player.guestUserId,
                  )!,
              ),
            }));
          }
          return new HttpResponse(null, { status });
        }),
      );
      return onReplace;
    }

    it("should send the whole new roster and show the player in the other team", async () => {
      const state = mockBackend({ teams: [teamA, teamB] });
      const onReplace = mockRoster(state);
      const { user } = renderMatchDetail();
      await screen.findByText("Time A");

      await user.click(within(teamCardOf("Time A")).getByRole("button", { name: /Carlos/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Mover para Time B" }));

      expect(await screen.findByText("Jogador movido")).toBeInTheDocument();
      expect(onReplace).toHaveBeenCalledExactlyOnceWith([
        { matchTeamId: "team-a", players: [] },
        {
          matchTeamId: "team-b",
          players: [{ guestUserId: "guest-1" }, { userId: "user-2" }],
        },
      ]);
      await waitFor(() =>
        expect(within(teamCardOf("Time B")).getByText("Carlos")).toBeInTheDocument(),
      );
      expect(within(teamCardOf("Time A")).getByText("Sem jogadores")).toBeInTheDocument();
    });

    it("should take a player out of the team and list them as unassigned", async () => {
      const state = mockBackend({ teams: [teamA, teamB] });
      const onReplace = mockRoster(state);
      const { user } = renderMatchDetail();
      await screen.findByText("Time A");

      await user.click(within(teamCardOf("Time B")).getByRole("button", { name: /Visitante/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Tirar do time" }));

      expect(await screen.findByText("Jogador movido")).toBeInTheDocument();
      expect(onReplace).toHaveBeenCalledExactlyOnceWith([
        { matchTeamId: "team-a", players: [{ userId: "user-2" }] },
        { matchTeamId: "team-b", players: [] },
      ]);
      expect(await screen.findByText("Sem time (2)")).toBeInTheDocument();
    });

    it("should put an unassigned player in a team", async () => {
      const state = mockBackend({ teams: [teamA, teamB] });
      const onReplace = mockRoster(state);
      const { user } = renderMatchDetail();
      const unassigned = (await screen.findByText("Sem time (1)")).closest(
        "div.rounded-xl",
      ) as HTMLElement;

      await user.click(within(unassigned).getByRole("button", { name: /Renan Luca/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Mover para Time A" }));

      expect(await screen.findByText("Jogador movido")).toBeInTheDocument();
      expect(onReplace).toHaveBeenCalledExactlyOnceWith([
        {
          matchTeamId: "team-a",
          players: [{ userId: "user-2" }, { userId: "user-logado" }],
        },
        { matchTeamId: "team-b", players: [{ guestUserId: "guest-1" }] },
      ]);
    });

    it("should lock the players while a move is in progress", async () => {
      const state = mockBackend({ teams: [teamA, teamB] });
      mockRoster(state, { responseDelay: 100 });
      const { user } = renderMatchDetail();
      await screen.findByText("Time A");

      await user.click(within(teamCardOf("Time A")).getByRole("button", { name: /Carlos/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Mover para Time B" }));

      await waitFor(() =>
        expect(
          within(teamCardOf("Time B")).getByRole("button", { name: /Visitante/ }),
        ).toBeDisabled(),
      );
      expect(await screen.findByText("Jogador movido")).toBeInTheDocument();
    });

    it("should show an error toast and keep the teams when the API fails", async () => {
      const state = mockBackend({ teams: [teamA, teamB] });
      mockRoster(state, { status: 500 });
      const { user } = renderMatchDetail();
      await screen.findByText("Time A");

      await user.click(within(teamCardOf("Time A")).getByRole("button", { name: /Carlos/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Mover para Time B" }));

      expect(
        await screen.findByText("Não foi possível mover o jogador. Tente novamente."),
      ).toBeInTheDocument();
      expect(within(teamCardOf("Time A")).getByText("Carlos")).toBeInTheDocument();
    });
  });
});
