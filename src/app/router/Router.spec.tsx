import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { http, HttpResponse } from "msw";
import { Router } from "@/src/app/router";
import { AuthProvider } from "@/src/app/contexts/AuthContext";
import { ThemeProvider } from "@/src/app/contexts/ThemeProvider";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { makePaginatedPayments } from "@/__tests__/factories/payment";
import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { makeMatchPresencesMock } from "@/__tests__/factories/matchPresences";
import { API_URL, presencesUrl } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";

const group = makeGroupMock({ id: "group-1", name: "Pelada de sexta", ownerId: "user-logado" });
const match = makeUpcomingMatchMock({
  id: "match-1",
  groupId: "group-1",
  matchDate: "2026-10-02T22:30:00.000Z",
});

function mockAppApi() {
  server.use(
    http.get(`${API_URL}/groups`, () => HttpResponse.json([group])),
    http.get(`${API_URL}/groups/group-1`, () => HttpResponse.json(group)),
    http.get(`${API_URL}/groups/group-1/group-members`, () =>
      HttpResponse.json([makeGroupMemberMock({ userId: "user-logado", name: "Renan", type: "OWNER" })]),
    ),
    http.get(`${API_URL}/groups/group-1/group-matches`, () => HttpResponse.json([])),
    http.get(`${API_URL}/groups/group-1/group-matches/match-1`, () =>
      HttpResponse.json(match),
    ),
    http.get(presencesUrl("group-1", "match-1"), () =>
      HttpResponse.json(makeMatchPresencesMock({ confirmeds: 2 })),
    ),
    http.get(`${API_URL}/groups/group-1/group-matches/match-1/match-teams`, () =>
      HttpResponse.json([]),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments`, () =>
      HttpResponse.json(makePaginatedPayments([])),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments/me`, () =>
      HttpResponse.json(makePaginatedPayments([])),
    ),
    http.get(`${API_URL}/users/me/upcoming-match`, () => HttpResponse.json(null)),
  );
}

function renderAppAt(path: string, { authenticated = false } = {}) {
  window.history.pushState({}, "", path);
  if (authenticated) authTokenStorage.set("test-token");
  mockAppApi();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("Router", () => {
  afterEach(() => window.history.replaceState({}, "", "/"));

  describe("public pages", () => {
    it.each([
      ["/", "Seja bem-vindo!"],
      ["/signup", "Crie sua conta"],
      ["/forgot-password", "Esqueceu a senha?"],
      ["/verify-email", "Link inválido"],
      ["/reset-password", "Link inválido"],
      ["/confirm-email-change", "Link inválido"],
    ])("should open %s without a session", async (path, heading) => {
      renderAppAt(path);

      expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
    });

    it("should wrap the public pages in the auth layout", async () => {
      renderAppAt("/signup");

      expect(
        await screen.findByText("A sua pelada de sempre, organizada como nunca!"),
      ).toBeInTheDocument();
    });
  });

  describe("protected pages without a session", () => {
    it.each(["/home", "/groups", "/groups/group-1", "/profile", "/groups/group-1/matches/match-1"])(
      "should send %s to the login",
      async (path) => {
        renderAppAt(path);

        expect(
          await screen.findByRole("heading", { name: "Seja bem-vindo!" }),
        ).toBeInTheDocument();
        expect(window.location.pathname).toBe("/");
      },
    );

    it("should send an invite link to the login remembering where to come back", async () => {
      renderAppAt("/invite/abc");

      expect(
        await screen.findByRole("heading", { name: "Seja bem-vindo!" }),
      ).toBeInTheDocument();
      expect(window.location.search).toBe("?redirect=%2Finvite%2Fabc");
    });
  });

  describe("protected pages with a session", () => {
    it("should open the home inside the app layout", async () => {
      renderAppAt("/home", { authenticated: true });

      expect(await screen.findByText("Olá, Renan!")).toBeInTheDocument();
      expect(screen.getAllByRole("link", { name: "Grupos" })).toHaveLength(2);
      expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
    });

    it("should open the groups list", async () => {
      renderAppAt("/groups", { authenticated: true });

      expect(await screen.findByRole("heading", { name: "Meus grupos" })).toBeInTheDocument();
      expect(await screen.findByText("Pelada de sexta")).toBeInTheDocument();
    });

    it("should open the profile", async () => {
      renderAppAt("/profile", { authenticated: true });

      expect(await screen.findByRole("heading", { name: "Perfil" })).toBeInTheDocument();
      expect(await screen.findByLabelText("Nome")).toHaveValue("Renan de Luca");
    });

    it("should open the group with its tabs and the current match tab", async () => {
      renderAppAt("/groups/group-1", { authenticated: true });

      expect(
        await screen.findByRole("heading", { name: "Pelada de sexta" }),
      ).toBeInTheDocument();
      expect(await screen.findByRole("link", { name: "Membros (1)" })).toBeInTheDocument();
      expect(await screen.findByText("Nenhuma partida marcada")).toBeInTheDocument();
    });

    it("should open the members tab of the group", async () => {
      renderAppAt("/groups/group-1/members", { authenticated: true });

      expect(await screen.findByText("Renan")).toBeInTheDocument();
      expect(screen.getByText("Dono")).toBeInTheDocument();
    });

    it("should open the payments tab of the group", async () => {
      renderAppAt("/groups/group-1/payments", { authenticated: true });

      expect(
        await screen.findByRole("heading", { name: "Pagamentos do grupo" }),
      ).toBeInTheDocument();
    });

    it("should open the match page", async () => {
      renderAppAt("/groups/group-1/matches/match-1", { authenticated: true });

      expect(
        await screen.findByRole("heading", { name: "Sexta-feira · 19:30" }),
      ).toBeInTheDocument();
      expect(await screen.findByRole("heading", { name: "Confirmados (2)" })).toBeInTheDocument();
    });
  });
});
