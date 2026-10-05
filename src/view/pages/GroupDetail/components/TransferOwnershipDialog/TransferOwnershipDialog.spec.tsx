import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { TransferOwnershipDialog } from "@/src/view/pages/GroupDetail/components/TransferOwnershipDialog";
import { queryKeys } from "@/src/app/lib/query-keys";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const group = makeGroupMock({ id: "group-1", ownerId: "user-logado" });

const owner = makeGroupMemberMock({
  userId: "user-logado",
  name: "Renan",
  type: "OWNER",
});
const carlos = makeGroupMemberMock({ userId: "user-2", name: "Carlos" });
const ana = makeGroupMemberMock({ userId: "user-3", name: "Ana" });

function mockMembers(members = [owner, carlos, ana]) {
  server.use(
    http.get(`${API_URL}/groups/group-1/group-members`, () =>
      HttpResponse.json(members),
    ),
  );
}

function mockTransfer({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onTransfer = vi.fn();
  server.use(
    http.patch(
      `${API_URL}/groups/group-1/transfer-ownership`,
      async ({ request }) => {
        await delay(responseDelay);
        onTransfer(await request.json());
        return HttpResponse.json(status === 200 ? group : {}, { status });
      },
    ),
  );
  return onTransfer;
}

function renderDialog() {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const { queryClient } = renderWithProviders(
    <TransferOwnershipDialog group={group} open onOpenChange={onOpenChange} />,
  );
  return { user, onOpenChange, queryClient };
}

async function chooseNewOwner(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByRole("combobox"));
  await user.click(await screen.findByRole("option", { name }));
}

function confirmButton() {
  return within(screen.getByRole("alertdialog")).getByRole("button", {
    name: "Transferir posse",
  });
}

describe("TransferOwnershipDialog", () => {
  it("should explain what happens to the owner", async () => {
    mockMembers();

    renderDialog();

    expect(
      await screen.findByRole("alertdialog", { name: "Transferir posse do grupo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A pessoa escolhida vira dona do grupo e você passa a ser mensalista.",
      ),
    ).toBeInTheDocument();
  });

  describe("choosing the new owner", () => {
    it("should offer every member except the current owner", async () => {
      mockMembers();
      const { user } = renderDialog();

      await user.click(await screen.findByRole("combobox"));

      expect(await screen.findByRole("option", { name: "Carlos" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Ana" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Renan" })).not.toBeInTheDocument();
    });

    it("should say there is nobody to receive the ownership when the owner is alone", async () => {
      mockMembers([owner]);

      renderDialog();

      expect(
        await screen.findByText("Não há outros membros pra receber a posse."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
    });

    it("should only enable the confirm button after a member is chosen", async () => {
      mockMembers();
      const { user } = renderDialog();
      await screen.findByRole("combobox");
      expect(confirmButton()).toBeDisabled();

      await chooseNewOwner(user, "Carlos");

      expect(confirmButton()).toBeEnabled();
    });
  });

  describe("transferring", () => {
    it("should send the chosen member, refresh the groups, show a toast and close", async () => {
      mockMembers();
      const onTransfer = mockTransfer();
      const { user, onOpenChange, queryClient } = renderDialog();
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      await chooseNewOwner(user, "Ana");

      await user.click(confirmButton());

      expect(await screen.findByText("Posse transferida")).toBeInTheDocument();
      expect(onTransfer).toHaveBeenCalledExactlyOnceWith({ newOwnerId: "user-3" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.groups });
    });

    it("should lock the dialog while the transfer is running", async () => {
      mockMembers();
      mockTransfer({ responseDelay: 100 });
      const { user } = renderDialog();
      await chooseNewOwner(user, "Carlos");

      await user.click(confirmButton());

      const dialog = screen.getByRole("alertdialog");
      expect(within(dialog).getByRole("button", { name: "Aguarde..." })).toBeDisabled();
      expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();
      expect(await screen.findByText("Posse transferida")).toBeInTheDocument();
    });

    it("should keep the dialog open and show an error toast when the API fails", async () => {
      mockMembers();
      mockTransfer({ status: 500 });
      const { user, onOpenChange } = renderDialog();
      await chooseNewOwner(user, "Carlos");

      await user.click(confirmButton());

      expect(
        await screen.findByText(
          "Não foi possível transferir a posse. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(confirmButton()).toBeEnabled();
    });
  });

  it("should close without transferring when the user cancels", async () => {
    mockMembers();
    const onTransfer = mockTransfer();
    const { user, onOpenChange } = renderDialog();
    await chooseNewOwner(user, "Carlos");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onTransfer).not.toHaveBeenCalled();
  });
});
