import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { GroupOverview } from "@/src/view/pages/GroupPayments/components/GroupOverview";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import {
  makePaginatedPayments,
  makePaymentMock,
} from "@/__tests__/factories/payment";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const owner = makeGroupMemberMock({ userId: "user-logado", name: "Renan Luca", type: "OWNER" });
const carlos = makeGroupMemberMock({ userId: "user-2", name: "Carlos", type: "MONTHLY" });
const ana = makeGroupMemberMock({ userId: "user-3", name: "Ana Souza", type: "MONTHLY" });
const bruno = makeGroupMemberMock({ userId: "user-4", name: "Bruno", type: "DAILY" });

function mockOverview({
  members = [owner, carlos, ana, bruno],
  payments = [] as ReturnType<typeof makePaymentMock>[],
  total,
  paymentsDelay = 0,
}: {
  members?: ReturnType<typeof makeGroupMemberMock>[];
  payments?: ReturnType<typeof makePaymentMock>[];
  total?: number;
  paymentsDelay?: number;
} = {}) {
  const onFetch = vi.fn();
  server.use(
    http.get(`${API_URL}/groups/group-1`, () =>
      HttpResponse.json(makeGroupMock({ id: "group-1", valuePerUser: 20 })),
    ),
    http.get(`${API_URL}/groups/group-1/group-members`, () =>
      HttpResponse.json(members),
    ),
    http.get(`${API_URL}/groups/group-1/group-payments`, async ({ request }) => {
      onFetch(Object.fromEntries(new URL(request.url).searchParams));
      await delay(paymentsDelay);
      return HttpResponse.json(makePaginatedPayments(payments, total));
    }),
  );
  return onFetch;
}

function renderOverview() {
  const user = userEvent.setup();
  renderWithProviders(<GroupOverview groupId="group-1" />);
  return user;
}

const rowOf = (name: string) =>
  screen.getByText(name).closest("div.rounded-lg") as HTMLElement;

describe("GroupOverview", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-15T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("should show the title and the current month while the data loads", async () => {
    mockOverview({ paymentsDelay: 100 });

    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Pagamentos do grupo" }),
    ).toBeInTheDocument();
    expect(screen.getByText("outubro de 2026")).toBeInTheDocument();
    expect(screen.queryByText("Mensalidades arrecadadas")).not.toBeInTheDocument();
    expect(await screen.findByText("Mensalidades arrecadadas")).toBeInTheDocument();
  });

  it("should ask for the payments of the current month", async () => {
    const onFetch = mockOverview();

    renderOverview();

    await screen.findByText("Mensalidades arrecadadas");
    expect(onFetch).toHaveBeenCalledWith(
      expect.objectContaining({ year: "2026", month: "10", limit: "100" }),
    );
  });

  describe("monthly fees", () => {
    it("should sum what was collected against what was expected", async () => {
      mockOverview({
        payments: [
          makePaymentMock({ id: "p1", userId: "user-logado", amount: 20 }),
          makePaymentMock({ id: "p2", userId: "user-2", amount: 20 }),
        ],
      });

      renderOverview();

      expect(await screen.findByText("R$ 40,00")).toBeInTheDocument();
      // dono + 2 mensalistas pagam mensalidade; o diarista não entra
      expect(screen.getByText("/ R$ 60,00")).toBeInTheDocument();
    });

    it("should list who paid and who is still pending", async () => {
      mockOverview({
        payments: [
          makePaymentMock({ id: "p1", userId: "user-logado", amount: 20 }),
          makePaymentMock({ id: "p2", userId: "user-2", amount: 20 }),
        ],
      });

      renderOverview();

      expect(
        await screen.findByRole("heading", { name: "Mensalidades (2/3)" }),
      ).toBeInTheDocument();
      expect(within(rowOf("Carlos")).getByText("R$ 20,00")).toBeInTheDocument();
      expect(within(rowOf("Ana Souza")).getByText("Pendente")).toBeInTheDocument();
      expect(within(rowOf("Renan Luca")).getByText("Dono")).toBeInTheDocument();
    });

    it("should leave daily members out of the fee checklist", async () => {
      mockOverview();

      renderOverview();

      await screen.findByRole("heading", { name: "Mensalidades (0/3)" });
      expect(screen.queryByText("Diarista")).not.toBeInTheDocument();
      expect(screen.queryByText("Bruno")).not.toBeInTheDocument();
    });

    it("should link the receipt of a paid fee", async () => {
      mockOverview({
        payments: [
          makePaymentMock({
            userId: "user-2",
            receipt: "https://example.com/carlos.png",
          }),
        ],
      });

      renderOverview();

      await screen.findByText("Mensalidades arrecadadas");
      expect(
        within(rowOf("Carlos")).getByRole("link", { name: "Comprovante" }),
      ).toHaveAttribute("href", "https://example.com/carlos.png");
    });

    it("should say there are no monthly members when everyone is daily", async () => {
      mockOverview({ members: [bruno] });

      renderOverview();

      expect(await screen.findByText("Nenhum mensalista no grupo")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Mensalidades (0/0)" }),
      ).toBeInTheDocument();
    });
  });

  describe("one-off payments", () => {
    it("should list each payment with the member, the match day and the registration day", async () => {
      mockOverview({
        payments: [
          makePaymentMock({
            id: "p9",
            userId: "user-4",
            matchId: "match-1",
            period: "2026-10-02T00:00:00.000Z",
            amount: 15,
            createdAt: "2026-10-03T15:00:00.000Z",
          }),
        ],
      });

      renderOverview();

      expect(
        await screen.findByRole("heading", { name: "Pagamentos avulsos de outubro (1)" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Bruno")).toBeInTheDocument();
      expect(
        screen.getByText("Partida de 02/10 · registrado em 03/10"),
      ).toBeInTheDocument();
      expect(screen.getByText("Avulsos (partidas): R$ 15,00")).toBeInTheDocument();
      expect(
        screen.queryByText("Nenhum pagamento avulso em outubro"),
      ).not.toBeInTheDocument();
    });

    it("should not mix one-off payments into the collected fees", async () => {
      mockOverview({
        payments: [
          makePaymentMock({ id: "p1", userId: "user-4", matchId: "match-1", amount: 15 }),
        ],
      });

      renderOverview();

      expect(
        await screen.findByRole("heading", { name: "Mensalidades (0/3)" }),
      ).toBeInTheDocument();
      expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    });

    it("should call a payer that left the group an ex-member", async () => {
      mockOverview({
        payments: [makePaymentMock({ userId: "gone", matchId: "match-1" })],
      });

      renderOverview();

      expect(await screen.findByText("Ex-membro")).toBeInTheDocument();
    });

    it("should say there are none when the month has no one-off payments", async () => {
      mockOverview();

      renderOverview();

      expect(
        await screen.findByText("Nenhum pagamento avulso em outubro"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Pagamentos avulsos de outubro (0)" }),
      ).toBeInTheDocument();
    });

    it("should warn when the month has more payments than the page shows", async () => {
      mockOverview({
        payments: [makePaymentMock({ matchId: "match-1", userId: "user-4" })],
        total: 150,
      });

      renderOverview();

      expect(
        await screen.findByText("Mostrando só os 100 primeiros pagamentos do mês."),
      ).toBeInTheDocument();
    });
  });

  describe("month navigation", () => {
    it("should not allow going past the current month", async () => {
      mockOverview();

      renderOverview();

      await screen.findByText("Mensalidades arrecadadas");
      expect(screen.getByRole("button", { name: "Próximo mês" })).toBeDisabled();
    });

    it("should load the previous month when the user goes back", async () => {
      const onFetch = mockOverview();
      const user = renderOverview();
      await screen.findByText("Mensalidades arrecadadas");

      await user.click(screen.getByRole("button", { name: "Mês anterior" }));

      expect(await screen.findByText("setembro de 2026")).toBeInTheDocument();
      expect(
        await screen.findByText("Nenhum pagamento avulso em setembro"),
      ).toBeInTheDocument();
      expect(onFetch).toHaveBeenLastCalledWith(
        expect.objectContaining({ year: "2026", month: "9" }),
      );
      expect(screen.getByRole("button", { name: "Próximo mês" })).toBeEnabled();
    });
  });
});
