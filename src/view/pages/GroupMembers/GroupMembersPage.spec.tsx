import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { GroupMembersPage } from "@/src/view/pages/GroupMembers";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const owner = makeGroupMemberMock({ userId: "user-logado", name: "Renan Luca", type: "OWNER" });
const carlos = makeGroupMemberMock({ userId: "user-2", name: "Carlos", type: "MONTHLY" });
const ana = makeGroupMemberMock({ userId: "user-3", name: "Ana Souza", type: "DAILY" });

function mockMembersPage({
  members = [owner, carlos, ana],
  ownerId = "user-logado",
  membersDelay = 0,
}: {
  members?: ReturnType<typeof makeGroupMemberMock>[];
  ownerId?: string;
  membersDelay?: number;
} = {}) {
  server.use(
    http.get(`${API_URL}/groups/group-1`, () =>
      HttpResponse.json(makeGroupMock({ id: "group-1", ownerId })),
    ),
    http.get(`${API_URL}/groups/group-1/group-members`, async () => {
      await delay(membersDelay);
      return HttpResponse.json(members);
    }),
  );
}

function renderMembersPage() {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path="/groups/:groupId/members" element={<GroupMembersPage />} />
    </Routes>,
    { route: "/groups/group-1/members" },
  );
  return user;
}

describe("GroupMembers Page", () => {
  it("should show a placeholder instead of the empty message while loading", async () => {
    mockMembersPage({ membersDelay: 100 });

    renderMembersPage();

    expect(screen.queryByText("Nenhum membro ainda")).not.toBeInTheDocument();
    expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
    expect(await screen.findByText("Carlos")).toBeInTheDocument();
  });

  it("should say there are no members when the list is empty", async () => {
    mockMembersPage({ members: [] });

    renderMembersPage();

    expect(await screen.findByText("Nenhum membro ainda")).toBeInTheDocument();
  });

  it("should list every member with their initials and type", async () => {
    mockMembersPage();

    renderMembersPage();

    expect(await screen.findByText("Renan Luca")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("RL")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("Dono")).toBeInTheDocument();
    expect(screen.getByText("Mensalista")).toBeInTheDocument();
    expect(screen.getByText("Diarista")).toBeInTheDocument();
  });

  describe("removing members", () => {
    it("should let the owner remove everyone except themselves", async () => {
      mockMembersPage();

      renderMembersPage();

      expect(
        await screen.findByRole("button", { name: "Remover Carlos" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Remover Ana Souza" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Remover Renan Luca" }),
      ).not.toBeInTheDocument();
    });

    it("should not offer removal to a regular member", async () => {
      mockMembersPage({ ownerId: "user-2" });

      renderMembersPage();

      expect(await screen.findByText("Carlos")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Remover/ })).not.toBeInTheDocument();
    });

    it("should ask for confirmation naming the member", async () => {
      mockMembersPage();
      const user = renderMembersPage();

      await user.click(await screen.findByRole("button", { name: "Remover Carlos" }));

      const dialog = await screen.findByRole("alertdialog", { name: "Remover Carlos?" });
      expect(
        within(dialog).getByText("Essa pessoa deixa de fazer parte do grupo."),
      ).toBeInTheDocument();
    });

    it("should do nothing when the owner cancels", async () => {
      mockMembersPage();
      const onRemove = vi.fn();
      server.use(
        http.delete(`${API_URL}/groups/group-1/group-members/user/user-2`, () => {
          onRemove();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = renderMembersPage();
      await user.click(await screen.findByRole("button", { name: "Remover Carlos" }));

      await user.click(await screen.findByRole("button", { name: "Cancelar" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText("Carlos")).toBeInTheDocument();
    });

    it("should remove the member, show a toast and refresh the list", async () => {
      let members = [owner, carlos, ana];
      mockMembersPage();
      const onRemove = vi.fn();
      server.use(
        http.get(`${API_URL}/groups/group-1/group-members`, () =>
          HttpResponse.json(members),
        ),
        http.delete(
          `${API_URL}/groups/group-1/group-members/user/user-2`,
          () => {
            onRemove();
            members = members.filter((member) => member.userId !== "user-2");
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );
      const user = renderMembersPage();
      await user.click(await screen.findByRole("button", { name: "Remover Carlos" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Remover" }));

      expect(await screen.findByText("Membro removido")).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByText("Carlos")).not.toBeInTheDocument(),
      );
      expect(onRemove).toHaveBeenCalledOnce();
      expect(screen.getByText("Ana Souza")).toBeInTheDocument();
    });

    it("should lock the dialog while the member is being removed", async () => {
      mockMembersPage();
      server.use(
        http.delete(`${API_URL}/groups/group-1/group-members/user/user-3`, async () => {
          await delay(100);
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = renderMembersPage();
      await user.click(await screen.findByRole("button", { name: "Remover Ana Souza" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Remover" }));

      expect(within(dialog).getByRole("button", { name: "Aguarde..." })).toBeDisabled();
      expect(await screen.findByText("Membro removido")).toBeInTheDocument();
    });

    it("should keep the member and show an error toast when the API fails", async () => {
      mockMembersPage();
      server.use(
        http.delete(`${API_URL}/groups/group-1/group-members/user/user-2`, () =>
          HttpResponse.json({}, { status: 500 }),
        ),
      );
      const user = renderMembersPage();
      await user.click(await screen.findByRole("button", { name: "Remover Carlos" }));

      const dialog = await screen.findByRole("alertdialog");
      await user.click(within(dialog).getByRole("button", { name: "Remover" }));

      expect(
        await screen.findByText("Não foi possível remover o membro. Tente novamente."),
      ).toBeInTheDocument();
      expect(screen.getByText("Carlos")).toBeInTheDocument();
    });
  });
});
