import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { GroupPaymentsPage } from "@/src/view/pages/GroupPayments";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { makePaginatedPayments } from "@/__tests__/factories/payment";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function mockPaymentsPage({
  ownerId,
  groupDelay = 0,
}: {
  ownerId: string;
  groupDelay?: number;
}) {
  server.use(
    http.get(`${API_URL}/groups/group-1`, async () => {
      await delay(groupDelay);
      return HttpResponse.json(makeGroupMock({ id: "group-1", ownerId }));
    }),
    http.get(`${API_URL}/groups/group-1/group-members`, () =>
      HttpResponse.json([
        makeGroupMemberMock({ userId: "user-logado", name: "Renan", type: ownerId === "user-logado" ? "OWNER" : "MONTHLY" }),
      ]),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments`, () =>
      HttpResponse.json(makePaginatedPayments([])),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments/me`, () =>
      HttpResponse.json(makePaginatedPayments([])),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments/pending-matches`, () =>
      HttpResponse.json([]),
    ),
  );
}

function renderPaymentsPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/groups/:groupId/payments" element={<GroupPaymentsPage />} />
    </Routes>,
    { route: "/groups/group-1/payments" },
  );
}

describe("GroupPayments Page", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-15T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("should show only a placeholder until the group and the user are known", async () => {
    mockPaymentsPage({ ownerId: "user-logado", groupDelay: 100 });

    renderPaymentsPage();

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Pagamentos do grupo" }),
    ).toBeInTheDocument();
  });

  describe("as the owner", () => {
    it("should show their own fee status and the group overview", async () => {
      mockPaymentsPage({ ownerId: "user-logado" });

      renderPaymentsPage();

      expect(
        await screen.findByRole("heading", { name: "Pagamentos do grupo" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Meus pagamentos" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("as a regular member", () => {
    it("should show only their own payments and history", async () => {
      mockPaymentsPage({ ownerId: "someone-else" });

      renderPaymentsPage();

      expect(
        await screen.findByRole("heading", { name: "Meus pagamentos" }),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Nenhum pagamento seu em outubro"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Pagamentos do grupo" }),
      ).not.toBeInTheDocument();
    });
  });
});
