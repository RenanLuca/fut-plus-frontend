import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { presencesUrl } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";
import { UpcomingMatchCard, type UpcomingMatchCardProps } from ".";
import { screen } from "@testing-library/react";
import { makeMatchPresencesMock } from "@/__tests__/factories/matchPresences";
import { getMatchDateParts } from "@/src/app/utils/format-match-date";
import userEvent from "@testing-library/user-event";

const now = new Date();
const upcomingMatch = makeUpcomingMatchMock({
  matchDate: new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    30,
  ).toISOString(),
});
const groupName = upcomingMatch.group.name;
const match = {
  id: upcomingMatch.id,
  groupId: upcomingMatch.groupId,
  matchDate: upcomingMatch.matchDate,
};
const group = upcomingMatch.group;
const url = presencesUrl(group.id, match.id);

type RenderUpcomingMatchCardOptions = Partial<UpcomingMatchCardProps> & {
  route?: string;
};

function renderUpcomingMatchCard({
  route = "/",
  ...props
}: RenderUpcomingMatchCardOptions = {}) {
  const result = renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={
          <UpcomingMatchCard groupName={groupName} match={match} {...props} />
        }
      />
      <Route
        path={`/groups/${group.id}/matches/${match.id}`}
        element={<h1 aria-label="match-page">Match Page</h1>}
      />
    </Routes>,
    { route, authenticated: true },
  );
  return { user: userEvent.setup(), ...result };
}

function mockPresences(options?: Parameters<typeof makeMatchPresencesMock>[0]) {
  server.use(
    http.get(url, () => HttpResponse.json(makeMatchPresencesMock(options))),
  );
}

// O GET devolve o usuário logado em `after` somente depois que o PATCH rodou
function mockPresenceFlow(
  after: "confirmed" | "declined",
  { patchDelay = 0 }: { patchDelay?: number } = {},
) {
  let loggedUserList: false | "confirmed" | "declined" = false;
  const onUpdatePresence = vi.fn();
  server.use(
    http.patch(url, async ({ request }) => {
      await delay(patchDelay);
      loggedUserList = after;
      onUpdatePresence(await request.json());
      return HttpResponse.json({ message: "ok" });
    }),
    http.get(url, () =>
      HttpResponse.json(
        makeMatchPresencesMock({ withLoggedUser: loggedUserList }),
      ),
    ),
  );
  return onUpdatePresence;
}

async function expectPendingState() {
  expect(await screen.findByText("Responda sua presença")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Não vou" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Vou" })).toBeInTheDocument();
}

describe("UpcomingMatchCard", () => {
  describe("Correct Data", () => {
    it("should show UpcomingMatchCard with confirmed players quantity correct", async () => {
      const confirmeds = 13;
      mockPresences({ confirmeds });

      renderUpcomingMatchCard();

      expect(
        await screen.findByText(`${confirmeds} confirmados`),
      ).toBeInTheDocument();
    });
    it.each([
      { confirmeds: 0, text: "0 confirmados" },
      { confirmeds: 1, text: "1 confirmado" },
      { confirmeds: 2, text: "2 confirmados" },
    ])(
      "should write the confirmed count as '$text'",
      async ({ confirmeds, text }) => {
        mockPresences({ confirmeds });

        renderUpcomingMatchCard();

        expect(await screen.findByText(text)).toBeInTheDocument();
      },
    );
    it.each([
      { confirmeds: 13, avatars: 4 },
      { confirmeds: 2, avatars: 2 },
    ])(
      "should show $avatars avatars for $confirmeds confirmed players",
      async ({ confirmeds, avatars }) => {
        mockPresences({ confirmeds });

        renderUpcomingMatchCard();

        expect(await screen.findAllByText("R")).toHaveLength(avatars);
      },
    );
    it("should show UpcomingMatchCard with correct date", () => {
      const { day, month, time, weekday } = getMatchDateParts(
        new Date(match.matchDate),
      );

      renderUpcomingMatchCard();

      expect(screen.getByText(day)).toBeInTheDocument();
      expect(screen.getByText(month)).toBeInTheDocument();
      expect(screen.getByText(`${weekday} - ${time}`)).toBeInTheDocument();
    });
  });

  describe("Loading", () => {
    it("should hide the presence info until the presences are loaded", async () => {
      server.use(
        http.get(url, async () => {
          await delay(100);
          return HttpResponse.json(makeMatchPresencesMock());
        }),
      );

      renderUpcomingMatchCard();

      expect(screen.queryByText("Responda sua presença")).not.toBeInTheDocument();
      expect(screen.queryByText(/confirmados/)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Vou" })).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Ver partida" }),
      ).not.toBeInTheDocument();

      await expectPendingState();
      expect(screen.getByText("10 confirmados")).toBeInTheDocument();
    });
  });

  describe("Presence already answered", () => {
    it.each([
      { withLoggedUser: "confirmed", chip: "Você confirmou" },
      { withLoggedUser: "declined", chip: "Você recusou" },
    ] as const)(
      "should show '$chip' and no answer buttons when the user is $withLoggedUser",
      async ({ withLoggedUser, chip }) => {
        mockPresences({ withLoggedUser });

        renderUpcomingMatchCard();

        expect(await screen.findByText(chip)).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Vou" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Não vou" }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "Ver partida" }),
        ).toBeInTheDocument();
      },
    );
  });

  describe("presence act", () => {
    it.each([
      {
        button: "Vou",
        isPresent: true,
        chip: "Você confirmou",
        toast: "Presença confirmada!",
        after: "confirmed",
      },
      {
        button: "Não vou",
        isPresent: false,
        chip: "Você recusou",
        toast: "Presença recusada",
        after: "declined",
      },
    ] as const)(
      "should set presence to $after when user clicks $button",
      async ({ button, isPresent, chip, toast, after }) => {
        const onUpdatePresence = mockPresenceFlow(after);
        const { user } = renderUpcomingMatchCard();

        await expectPendingState();
        await user.click(screen.getByRole("button", { name: button }));

        expect(await screen.findByText(chip)).toBeInTheDocument();
        expect(onUpdatePresence).toHaveBeenCalledWith({ isPresent });
        expect(await screen.findByText(toast)).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: button }),
        ).not.toBeInTheDocument();
        expect(
          await screen.findByRole("link", { name: "Ver partida" }),
        ).toBeInTheDocument();
      },
    );
    it("should disable both buttons while the request is pending", async () => {
      mockPresenceFlow("confirmed", { patchDelay: 100 });
      const { user } = renderUpcomingMatchCard();

      await expectPendingState();
      await user.click(screen.getByRole("button", { name: "Vou" }));

      expect(screen.getByRole("button", { name: "Vou" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Não vou" })).toBeDisabled();
      expect(await screen.findByText("Você confirmou")).toBeInTheDocument();
    });
    it("should keep the user pending and show an error toast when the request fails", async () => {
      mockPresences();
      server.use(
        http.patch(url, () => HttpResponse.json({}, { status: 500 })),
      );
      const { user } = renderUpcomingMatchCard();

      await expectPendingState();
      await user.click(screen.getByRole("button", { name: "Vou" }));

      expect(
        await screen.findByText(
          "Não foi possível atualizar sua presença. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Responda sua presença")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Vou" })).toBeEnabled();
    });
  });

  describe("Presences request fails", () => {
    it("should only offer the link to the match", async () => {
      server.use(http.get(url, () => HttpResponse.json({}, { status: 500 })));

      renderUpcomingMatchCard();

      expect(
        await screen.findByRole("link", { name: "Ver partida" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("Responda sua presença")).not.toBeInTheDocument();
      expect(screen.queryByText(/confirmados/)).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Vou" })).not.toBeInTheDocument();
    });
  });

  describe("Link", () => {
    it("should redirect when user click to see match", async () => {
      mockPresences({ withLoggedUser: "confirmed" });
      const { user } = renderUpcomingMatchCard();

      await user.click(
        await screen.findByRole("link", { name: "Ver partida" }),
      );

      expect(
        await screen.findByRole("heading", { name: "match-page" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "Ver partida" }),
      ).not.toBeInTheDocument();
    });
  });
});
