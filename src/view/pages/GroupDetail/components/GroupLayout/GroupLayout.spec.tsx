import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { GroupLayout } from "@/src/view/pages/GroupDetail/components/GroupLayout";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const group = makeGroupMock({
  id: "group-1",
  name: "Pelada de sexta",
  ownerId: "user-logado",
  weekday: "FRIDAY",
  hour: "20:00",
  frequency: "EVENTUAL",
});

function mockGroupRequests({
  groupDelay = 0,
  memberCount = 3,
}: { groupDelay?: number; memberCount?: number } = {}) {
  server.use(
    http.get(`${API_URL}/groups/${group.id}`, async () => {
      await delay(groupDelay);
      return HttpResponse.json(group);
    }),
    http.get(`${API_URL}/groups/${group.id}/group-members`, () =>
      HttpResponse.json(
        Array.from({ length: memberCount }, (_, index) =>
          makeGroupMemberMock({ userId: `user-${index}` }),
        ),
      ),
    ),
  );
}

function renderGroupLayout(route = `/groups/${group.id}`) {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route path="/groups/:groupId" element={<GroupLayout />}>
        <Route index element={<p>current match tab</p>} />
        <Route path="members" element={<p>members tab</p>} />
        <Route path="payments" element={<p>payments tab</p>} />
      </Route>
    </Routes>,
    { route },
  );
  return user;
}

describe("GroupLayout", () => {
  it("should show only a placeholder while the group is loading", async () => {
    mockGroupRequests({ groupDelay: 100 });

    renderGroupLayout();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Pelada de sexta" }),
    ).toBeInTheDocument();
  });

  it("should show the group name, schedule and frequency", async () => {
    mockGroupRequests();

    renderGroupLayout();

    expect(
      await screen.findByRole("heading", { name: "Pelada de sexta" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sexta, 20:00")).toBeInTheDocument();
    expect(screen.getByText("Eventual")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ações do grupo" }),
    ).toBeInTheDocument();
  });

  describe("tabs", () => {
    it("should link to the three sections of the group", async () => {
      mockGroupRequests();

      renderGroupLayout();

      const nav = await screen.findByRole("navigation");
      expect(
        within(nav).getByRole("link", { name: "Partida atual" }),
      ).toHaveAttribute("href", "/groups/group-1");
      expect(
        await within(nav).findByRole("link", { name: "Membros (3)" }),
      ).toHaveAttribute("href", "/groups/group-1/members");
      expect(
        within(nav).getByRole("link", { name: "Pagamentos" }),
      ).toHaveAttribute("href", "/groups/group-1/payments");
    });

    it("should show the member count in the tab once it is known", async () => {
      mockGroupRequests({ memberCount: 12 });

      renderGroupLayout();

      expect(
        await screen.findByRole("link", { name: "Membros (12)" }),
      ).toBeInTheDocument();
    });

    it("should render the current match section by default", async () => {
      mockGroupRequests();

      renderGroupLayout();

      expect(await screen.findByText("current match tab")).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: "Partida atual" }),
      ).toHaveAttribute("aria-current", "page");
    });

    it("should switch the section and mark the active tab when the user clicks one", async () => {
      mockGroupRequests();
      const user = renderGroupLayout();

      await user.click(await screen.findByRole("link", { name: "Pagamentos" }));

      expect(await screen.findByText("payments tab")).toBeInTheDocument();
      expect(screen.queryByText("current match tab")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Pagamentos" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        screen.getByRole("link", { name: "Partida atual" }),
      ).not.toHaveAttribute("aria-current");
    });

    it("should open straight on the members section when the url says so", async () => {
      mockGroupRequests();

      renderGroupLayout("/groups/group-1/members");

      expect(await screen.findByText("members tab")).toBeInTheDocument();
      expect(
        await screen.findByRole("link", { name: "Membros (3)" }),
      ).toHaveAttribute("aria-current", "page");
    });
  });
});
