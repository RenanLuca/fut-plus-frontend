import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { InviteLinkModal } from "@/src/view/pages/GroupDetail/components/InviteLinkModal";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const inviteUrl = `${API_URL}/groups/group-1/invite`;
const linkOf = (inviteId: string) => `${window.location.origin}/invite/${inviteId}`;

function makeInvite(id: string) {
  return { id, groupId: "group-1", createdAt: "2026-01-01T00:00:00Z" };
}

function renderModal() {
  const user = userEvent.setup();
  renderWithProviders(
    <InviteLinkModal groupId="group-1" open onOpenChange={vi.fn()} />,
  );
  return user;
}

function mockCurrentInvite(inviteId: string | null) {
  server.use(
    http.get(inviteUrl, () =>
      inviteId
        ? HttpResponse.json(makeInvite(inviteId))
        : HttpResponse.json({}, { status: 404 }),
    ),
  );
}

function mockRegenerate({
  inviteId = "invite-new",
  status = 201,
  responseDelay = 0,
}: { inviteId?: string; status?: number; responseDelay?: number } = {}) {
  const onRegenerate = vi.fn();
  server.use(
    http.post(inviteUrl, async () => {
      await delay(responseDelay);
      onRegenerate();
      return HttpResponse.json(status === 201 ? makeInvite(inviteId) : {}, {
        status,
      });
    }),
  );
  return onRegenerate;
}

function mockRevoke({ status = 204 }: { status?: number } = {}) {
  const onRevoke = vi.fn();
  server.use(
    http.delete(inviteUrl, () => {
      onRevoke();
      return new HttpResponse(null, { status });
    }),
  );
  return onRevoke;
}

describe("InviteLinkModal", () => {
  it("should show the title and only a placeholder while the invite loads", async () => {
    server.use(
      http.get(inviteUrl, async () => {
        await delay(100);
        return HttpResponse.json(makeInvite("invite-1"));
      }),
    );

    renderModal();

    expect(
      await screen.findByRole("heading", { name: "Convidar por link" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Link de convite")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gerar link" })).not.toBeInTheDocument();
    expect(await screen.findByLabelText("Link de convite")).toBeInTheDocument();
  });

  describe("group without a link", () => {
    it("should offer to generate the first link", async () => {
      mockCurrentInvite(null);

      renderModal();

      expect(
        await screen.findByText("Este grupo ainda não tem um link de convite"),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gerar link" })).toBeInTheDocument();
      expect(screen.queryByLabelText("Link de convite")).not.toBeInTheDocument();
    });

    it("should generate the link, show it and tell the user", async () => {
      mockCurrentInvite(null);
      const onRegenerate = mockRegenerate({ inviteId: "invite-9" });
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Gerar link" }));

      expect(await screen.findByLabelText("Link de convite")).toHaveValue(
        linkOf("invite-9"),
      );
      expect(await screen.findByText("Link gerado")).toBeInTheDocument();
      expect(onRegenerate).toHaveBeenCalledOnce();
      expect(screen.queryByRole("button", { name: "Gerar link" })).not.toBeInTheDocument();
    });

    it("should disable the button while the link is being generated", async () => {
      mockCurrentInvite(null);
      mockRegenerate({ responseDelay: 100 });
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Gerar link" }));

      expect(screen.getByRole("button", { name: "Gerando..." })).toBeDisabled();
      expect(await screen.findByLabelText("Link de convite")).toBeInTheDocument();
    });

    it("should show an error toast when the link cannot be generated", async () => {
      mockCurrentInvite(null);
      mockRegenerate({ status: 500 });
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Gerar link" }));

      expect(
        await screen.findByText("Não foi possível gerar o link. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Gerar link" })).toBeEnabled();
    });
  });

  describe("group with a link", () => {
    it("should show the full invite link", async () => {
      mockCurrentInvite("invite-1");

      renderModal();

      expect(await screen.findByLabelText("Link de convite")).toHaveValue(
        linkOf("invite-1"),
      );
      expect(screen.getByLabelText("Link de convite")).toHaveAttribute("readonly");
      expect(
        screen.getByText("O link não expira. Se ele vazar, gere um novo ou revogue."),
      ).toBeInTheDocument();
    });

    it("should copy the link to the clipboard", async () => {
      mockCurrentInvite("invite-1");
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Copiar" }));

      expect(await screen.findByText("Link copiado")).toBeInTheDocument();
      expect(await navigator.clipboard.readText()).toBe(linkOf("invite-1"));
    });

    it("should tell the user to copy manually when the clipboard is blocked", async () => {
      mockCurrentInvite("invite-1");
      const user = renderModal();
      vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
        new Error("denied"),
      );

      await user.click(await screen.findByRole("button", { name: "Copiar" }));

      expect(
        await screen.findByText(
          "Não foi possível copiar. Selecione o link e copie manualmente.",
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText("Link copiado")).not.toBeInTheDocument();
    });
  });

  describe("generating a new link", () => {
    it("should warn that the current link stops working and wait for confirmation", async () => {
      mockCurrentInvite("invite-1");
      const onRegenerate = mockRegenerate();
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Gerar novo link" }));

      const dialog = await screen.findByRole("alertdialog", { name: "Gerar novo link?" });
      expect(
        within(dialog).getByText(
          "O link atual deixa de funcionar. Quem já entrou continua no grupo.",
        ),
      ).toBeInTheDocument();
      expect(onRegenerate).not.toHaveBeenCalled();
    });

    it("should replace the link after the user confirms", async () => {
      mockCurrentInvite("invite-1");
      mockRegenerate({ inviteId: "invite-2" });
      const user = renderModal();
      await user.click(await screen.findByRole("button", { name: "Gerar novo link" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Gerar novo link" }));

      await waitFor(() =>
        expect(screen.getByLabelText("Link de convite")).toHaveValue(linkOf("invite-2")),
      );
      expect(await screen.findByText("Link gerado")).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
    });

    it("should keep the current link when the user cancels", async () => {
      mockCurrentInvite("invite-1");
      const onRegenerate = mockRegenerate();
      const user = renderModal();
      await user.click(await screen.findByRole("button", { name: "Gerar novo link" }));

      await user.click(await screen.findByRole("button", { name: "Cancelar" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(onRegenerate).not.toHaveBeenCalled();
      expect(screen.getByLabelText("Link de convite")).toHaveValue(linkOf("invite-1"));
    });
  });

  describe("revoking the link", () => {
    it("should warn and wait for confirmation", async () => {
      mockCurrentInvite("invite-1");
      const onRevoke = mockRevoke();
      const user = renderModal();

      await user.click(await screen.findByRole("button", { name: "Revogar link" }));

      const dialog = await screen.findByRole("alertdialog", { name: "Revogar link?" });
      expect(
        within(dialog).getByText(
          "O link deixa de funcionar e ninguém mais entra por ele. Quem já entrou continua no grupo.",
        ),
      ).toBeInTheDocument();
      expect(onRevoke).not.toHaveBeenCalled();
    });

    it("should remove the link after the user confirms", async () => {
      mockCurrentInvite("invite-1");
      const onRevoke = mockRevoke();
      const user = renderModal();
      await user.click(await screen.findByRole("button", { name: "Revogar link" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Revogar link" }));

      expect(await screen.findByText("Link revogado")).toBeInTheDocument();
      expect(onRevoke).toHaveBeenCalledOnce();
      expect(
        await screen.findByText("Este grupo ainda não tem um link de convite"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Link de convite")).not.toBeInTheDocument();
    });

    it("should keep the link and show an error toast when the API fails", async () => {
      mockCurrentInvite("invite-1");
      mockRevoke({ status: 500 });
      const user = renderModal();
      await user.click(await screen.findByRole("button", { name: "Revogar link" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Revogar link" }));

      expect(
        await screen.findByText("Não foi possível revogar o link. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Link de convite")).toHaveValue(linkOf("invite-1"));
    });
  });
});
