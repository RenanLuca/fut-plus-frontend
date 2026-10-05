import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { MyPaymentsHistory } from "@/src/view/pages/GroupPayments/components/MyPaymentsHistory";
import {
  makePaginatedPayments,
  makePaymentMock,
} from "@/__tests__/factories/payment";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function mockHistory({
  payments = [] as ReturnType<typeof makePaymentMock>[],
  responseDelay = 0,
} = {}) {
  const onFetch = vi.fn();
  server.use(
    http.get(`${API_URL}/groups/group-1/group-payments/me`, async ({ request }) => {
      onFetch(Object.fromEntries(new URL(request.url).searchParams));
      await delay(responseDelay);
      return HttpResponse.json(makePaginatedPayments(payments));
    }),
  );
  return onFetch;
}

function renderHistory() {
  const user = userEvent.setup();
  renderWithProviders(<MyPaymentsHistory groupId="group-1" />);
  return user;
}

describe("MyPaymentsHistory", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-15T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("should start on the current month and hide the empty message while loading", async () => {
    mockHistory({ responseDelay: 100 });

    renderHistory();

    expect(screen.getByText("outubro de 2026")).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum pagamento seu/)).not.toBeInTheDocument();
    expect(await screen.findByText("Nenhum pagamento seu em outubro")).toBeInTheDocument();
  });

  it("should say there are no payments when the month is empty", async () => {
    mockHistory();

    renderHistory();

    expect(await screen.findByText("Nenhum pagamento seu em outubro")).toBeInTheDocument();
  });

  it("should list the monthly fee and the per-match payments", async () => {
    mockHistory({
      payments: [
        makePaymentMock({
          id: "p1",
          amount: 20,
          createdAt: "2026-10-05T15:00:00.000Z",
        }),
        makePaymentMock({
          id: "p2",
          matchId: "match-1",
          period: "2026-10-02T00:00:00.000Z",
          amount: 15,
          createdAt: "2026-10-03T15:00:00.000Z",
        }),
      ],
    });

    renderHistory();

    expect(await screen.findByText("Mensalidade de outubro")).toBeInTheDocument();
    expect(screen.getByText("Registrado em 05/10")).toBeInTheDocument();
    expect(screen.getByText("R$ 20,00")).toBeInTheDocument();
    expect(screen.getByText("Partida de 02/10")).toBeInTheDocument();
    expect(screen.getByText("Registrado em 03/10")).toBeInTheDocument();
    expect(screen.getByText("R$ 15,00")).toBeInTheDocument();
    expect(screen.queryByText(/Nenhum pagamento seu/)).not.toBeInTheDocument();
  });

  it("should link the receipt of a payment that has one", async () => {
    mockHistory({
      payments: [makePaymentMock({ receipt: "https://example.com/pix.png" })],
    });

    renderHistory();

    expect(await screen.findByRole("link", { name: "Comprovante" })).toHaveAttribute(
      "href",
      "https://example.com/pix.png",
    );
  });

  it("should ask for the current month's payments first", async () => {
    const onFetch = mockHistory();

    renderHistory();

    await screen.findByText("Nenhum pagamento seu em outubro");
    expect(onFetch).toHaveBeenCalledWith(
      expect.objectContaining({ year: "2026", month: "10", limit: "100" }),
    );
  });

  it("should load another month when the user navigates", async () => {
    const onFetch = mockHistory();
    const user = renderHistory();
    await screen.findByText("Nenhum pagamento seu em outubro");
    expect(screen.getByRole("button", { name: "Próximo mês" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Mês anterior" }));

    expect(await screen.findByText("Nenhum pagamento seu em setembro")).toBeInTheDocument();
    expect(onFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({ year: "2026", month: "9" }),
    );
    expect(screen.getByRole("button", { name: "Próximo mês" })).toBeEnabled();
  });
});
