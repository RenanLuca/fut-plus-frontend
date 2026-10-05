import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes, useLocation } from "react-router";
import { InvitePage } from "@/src/view/pages/Invite";
import { queryKeys } from "@/src/app/lib/query-keys";
import { makeInvitePreviewMock } from "@/__tests__/factories/invitePreview";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const inviteUrl = `${API_URL}/invites/invite-1`;

function LoginStub() {
  const { search } = useLocation();
  return <p>login page {search}</p>;
}

function renderInvitePage({ authenticated = true } = {}) {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <Routes>
      <Route path="/" element={<LoginStub />} />
      <Route path="/invite/:inviteId" element={<InvitePage />} />
      <Route path="/groups/:groupId" element={<p>group page</p>} />
    </Routes>,
    { route: "/invite/invite-1", authenticated },
  );
  return { user, queryClient };
}

function mockInvite(overrides: Parameters<typeof makeInvitePreviewMock>[0] = {}) {
  server.use(
    http.get(inviteUrl, () => HttpResponse.json(makeInvitePreviewMock(overrides))),
  );
}

function mockAccept({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onAccept = vi.fn();
  server.use(
    http.post(`${inviteUrl}/accept`, async ({ request }) => {
      await delay(responseDelay);
      onAccept(await request.json());
      return HttpResponse.json(
        status === 201
          ? { id: "m1", groupId: "group-1", userId: "u1", type: "MONTHLY", rank: "BALLON_DOR" }
          : {},
        { status },
      );
    }),
  );
  return onAccept;
}

async function fillAndJoin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("combobox", { name: "Como você vai jogar" }),
  );
  await user.click(await screen.findByRole("option", { name: "Mensalista" }));
  await user.click(screen.getByRole("radio", { name: "Bola de Ouro" }));
  await user.click(screen.getByRole("button", { name: "Entrar no grupo" }));
}

describe("Invite Page", () => {
  it("should send a logged out user to the login keeping the invite path to come back", async () => {
    mockInvite();

    renderInvitePage({ authenticated: false });

    expect(
      await screen.findByText("login page ?redirect=%2Finvite%2Finvite-1"),
    ).toBeInTheDocument();
  });

  it("should show a placeholder while the invite is loading", async () => {
    server.use(
      http.get(inviteUrl, async () => {
        await delay(100);
        return HttpResponse.json(makeInvitePreviewMock());
      }),
    );

    renderInvitePage();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Pelada de sexta" }),
    ).toBeInTheDocument();
  });

  it("should show an invalid invite screen when it does not exist", async () => {
    server.use(http.get(inviteUrl, () => HttpResponse.json({}, { status: 404 })));

    renderInvitePage();

    expect(
      await screen.findByRole("heading", { name: "Convite inválido" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o início" })).toHaveAttribute(
      "href",
      "/home",
    );
    expect(
      screen.queryByRole("button", { name: "Entrar no grupo" }),
    ).not.toBeInTheDocument();
  });

  describe("invite details", () => {
    it("should show who invited, the group and its schedule", async () => {
      mockInvite();

      renderInvitePage();

      expect(
        await screen.findByRole("heading", { name: "Pelada de sexta" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Carlos convidou você para")).toBeInTheDocument();
      expect(screen.getByText("Sexta, 20:00")).toBeInTheDocument();
      expect(screen.getByText("Eventual")).toBeInTheDocument();
      expect(screen.getByText("R$ 20,00 por pessoa")).toBeInTheDocument();
      expect(screen.getByText("8 jogadores")).toBeInTheDocument();
    });

    it("should write the player count in the singular", async () => {
      mockInvite({ membersCount: 1 });

      renderInvitePage();

      expect(await screen.findByText("1 jogador")).toBeInTheDocument();
    });
  });

  describe("user that already belongs to the group", () => {
    it("should offer the link to the group instead of the form", async () => {
      mockInvite({ alreadyMember: true });

      renderInvitePage();

      expect(
        await screen.findByText("Você já faz parte deste grupo."),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Ir para o grupo" })).toHaveAttribute(
        "href",
        "/groups/group-1",
      );
      expect(
        screen.queryByRole("button", { name: "Entrar no grupo" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("joining the group", () => {
    it("should ask how the user will play and their level before joining", async () => {
      mockInvite();
      const onAccept = mockAccept();
      const { user } = renderInvitePage();

      await user.click(
        await screen.findByRole("button", { name: "Entrar no grupo" }),
      );

      expect(
        await screen.findByText("Selecione como você vai jogar"),
      ).toBeInTheDocument();
      expect(screen.getByText("Selecione o seu nível")).toBeInTheDocument();
      expect(onAccept).not.toHaveBeenCalled();
    });

    it("should join, refresh the groups and go to the group page", async () => {
      mockInvite();
      const onAccept = mockAccept();
      const { user, queryClient } = renderInvitePage();
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

      await fillAndJoin(user);

      expect(await screen.findByText("group page")).toBeInTheDocument();
      expect(await screen.findByText("Você entrou no grupo")).toBeInTheDocument();
      expect(onAccept).toHaveBeenCalledExactlyOnceWith({
        type: "MONTHLY",
        rank: "BALLON_DOR",
      });
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.groups });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.upcomingMatch,
      });
    });

    it("should disable the button while joining", async () => {
      mockInvite();
      mockAccept({ responseDelay: 100 });
      const { user } = renderInvitePage();

      await fillAndJoin(user);

      expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
      expect(await screen.findByText("group page")).toBeInTheDocument();
    });

    it("should show the already-a-member state when the API answers 409", async () => {
      let alreadyMember = false;
      server.use(
        http.get(inviteUrl, () =>
          HttpResponse.json(makeInvitePreviewMock({ alreadyMember })),
        ),
        http.post(`${inviteUrl}/accept`, () => {
          alreadyMember = true;
          return HttpResponse.json({}, { status: 409 });
        }),
      );
      const { user } = renderInvitePage();

      await fillAndJoin(user);

      expect(
        await screen.findByText("Você já faz parte deste grupo.", {
          selector: "div",
        }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: "Ir para o grupo" }),
      ).toBeInTheDocument();
    });

    it("should keep the form and show a toast when the API fails", async () => {
      mockInvite();
      mockAccept({ status: 500 });
      const { user } = renderInvitePage();

      await fillAndJoin(user);

      expect(
        await screen.findByText(
          "Não foi possível entrar no grupo. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Entrar no grupo" })).toBeEnabled();
      expect(screen.queryByText("group page")).not.toBeInTheDocument();
    });
  });
});
