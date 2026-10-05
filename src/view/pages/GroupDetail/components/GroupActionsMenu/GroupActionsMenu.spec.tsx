import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { GroupActionsMenu } from "@/src/view/pages/GroupDetail/components/GroupActionsMenu";
import { queryKeys } from "@/src/app/lib/query-keys";
import { makeGroupMock } from "@/__tests__/factories/group";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const group = makeGroupMock({ id: "group-1", name: "Pelada de sexta" });

function renderMenu({ isOwner }: { isOwner: boolean }) {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <Routes>
      <Route
        path="/groups/:groupId"
        element={<GroupActionsMenu group={group} isOwner={isOwner} />}
      />
      <Route path="/groups" element={<p>groups page</p>} />
    </Routes>,
    { route: "/groups/group-1" },
  );
  return { user, queryClient };
}

async function chooseMenuItem(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: "Ações do grupo" }));
  await user.click(await screen.findByRole("menuitem", { name }));
}

function mockRemoval(
  method: "delete",
  path: string,
  { status = 204, responseDelay = 0 }: { status?: number; responseDelay?: number } = {},
) {
  const onRequest = vi.fn();
  server.use(
    http[method](`${API_URL}${path}`, async () => {
      await delay(responseDelay);
      onRequest();
      return new HttpResponse(null, { status });
    }),
  );
  return onRequest;
}

describe("GroupActionsMenu", () => {
  describe("menu options", () => {
    it("should offer the management actions to the owner", async () => {
      const { user } = renderMenu({ isOwner: true });

      await user.click(screen.getByRole("button", { name: "Ações do grupo" }));

      expect(
        await screen.findByRole("menuitem", { name: "Convidar por link" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: "Editar grupo" })).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: "Transferir posse" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: "Apagar grupo" })).toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: "Sair do grupo" }),
      ).not.toBeInTheDocument();
    });

    it("should only offer to leave the group to a regular member", async () => {
      const { user } = renderMenu({ isOwner: false });

      await user.click(screen.getByRole("button", { name: "Ações do grupo" }));

      expect(
        await screen.findByRole("menuitem", { name: "Sair do grupo" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    });
  });

  describe("opening the owner tools", () => {
    it("should open the edit form with the group data", async () => {
      const { user } = renderMenu({ isOwner: true });

      await chooseMenuItem(user, "Editar grupo");

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Editar grupo" })).toBeInTheDocument();
      expect(screen.getByLabelText("Nome do grupo")).toHaveValue("Pelada de sexta");
    });

    it("should open the invite link sheet", async () => {
      server.use(
        http.get(`${API_URL}/groups/group-1/invite`, () =>
          HttpResponse.json({}, { status: 404 }),
        ),
      );
      const { user } = renderMenu({ isOwner: true });

      await chooseMenuItem(user, "Convidar por link");

      expect(
        await screen.findByRole("heading", { name: "Convidar por link" }),
      ).toBeInTheDocument();
    });

    it("should open the ownership transfer dialog", async () => {
      server.use(
        http.get(`${API_URL}/groups/group-1/group-members`, () =>
          HttpResponse.json([]),
        ),
      );
      const { user } = renderMenu({ isOwner: true });

      await chooseMenuItem(user, "Transferir posse");

      expect(
        await screen.findByRole("alertdialog", { name: "Transferir posse do grupo" }),
      ).toBeInTheDocument();
    });
  });

  describe("deleting the group", () => {
    it("should ask for confirmation before doing anything", async () => {
      const onDelete = mockRemoval("delete", "/groups/group-1");
      const { user } = renderMenu({ isOwner: true });

      await chooseMenuItem(user, "Apagar grupo");

      const dialog = await screen.findByRole("alertdialog", { name: "Apagar grupo?" });
      expect(
        within(dialog).getByText(/Membros, partidas, presenças, times e pagamentos/),
      ).toBeInTheDocument();
      expect(onDelete).not.toHaveBeenCalled();
    });

    it("should do nothing when the user cancels", async () => {
      const onDelete = mockRemoval("delete", "/groups/group-1");
      const { user } = renderMenu({ isOwner: true });
      await chooseMenuItem(user, "Apagar grupo");

      await user.click(await screen.findByRole("button", { name: "Cancelar" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(onDelete).not.toHaveBeenCalled();
    });

    it("should delete the group, refresh the lists and go back to the groups page", async () => {
      const onDelete = mockRemoval("delete", "/groups/group-1");
      const { user, queryClient } = renderMenu({ isOwner: true });
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const removeQueries = vi.spyOn(queryClient, "removeQueries");
      await chooseMenuItem(user, "Apagar grupo");

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Apagar grupo" }));

      expect(await screen.findByText("groups page")).toBeInTheDocument();
      expect(await screen.findByText("Grupo apagado")).toBeInTheDocument();
      expect(onDelete).toHaveBeenCalledOnce();
      expect(removeQueries).toHaveBeenCalledWith({ queryKey: queryKeys.group("group-1") });
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.groups });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.upcomingMatch,
      });
    });

    it("should lock the dialog while the group is being deleted", async () => {
      mockRemoval("delete", "/groups/group-1", { responseDelay: 100 });
      const { user } = renderMenu({ isOwner: true });
      await chooseMenuItem(user, "Apagar grupo");

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Apagar grupo" }));

      expect(within(dialog).getByRole("button", { name: "Aguarde..." })).toBeDisabled();
      expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(await screen.findByText("groups page")).toBeInTheDocument();
    });

    it("should stay on the page and show an error toast when the API fails", async () => {
      mockRemoval("delete", "/groups/group-1", { status: 500 });
      const { user } = renderMenu({ isOwner: true });
      await chooseMenuItem(user, "Apagar grupo");

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Apagar grupo" }));

      expect(
        await screen.findByText("Não foi possível apagar o grupo. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.queryByText("groups page")).not.toBeInTheDocument();
    });
  });

  describe("leaving the group", () => {
    it("should name the group in the confirmation", async () => {
      const { user } = renderMenu({ isOwner: false });

      await chooseMenuItem(user, "Sair do grupo");

      const dialog = await screen.findByRole("alertdialog", { name: "Sair do grupo?" });
      expect(
        within(dialog).getByText(
          "Você deixa de fazer parte de Pelada de sexta e não vai mais ver as partidas dele.",
        ),
      ).toBeInTheDocument();
    });

    it("should leave the group, show a toast and go back to the groups page", async () => {
      const onLeave = mockRemoval("delete", "/groups/group-1/group-members/leave");
      const { user } = renderMenu({ isOwner: false });
      await chooseMenuItem(user, "Sair do grupo");

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Sair do grupo" }));

      expect(await screen.findByText("groups page")).toBeInTheDocument();
      expect(await screen.findByText("Você saiu do grupo")).toBeInTheDocument();
      expect(onLeave).toHaveBeenCalledOnce();
    });

    it("should stay on the page and show an error toast when the API fails", async () => {
      mockRemoval("delete", "/groups/group-1/group-members/leave", { status: 500 });
      const { user } = renderMenu({ isOwner: false });
      await chooseMenuItem(user, "Sair do grupo");

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Sair do grupo" }));

      expect(
        await screen.findByText("Não foi possível sair do grupo. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.queryByText("groups page")).not.toBeInTheDocument();
    });
  });
});
