import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { MyPaymentStatus } from "@/src/view/pages/GroupPayments/components/MyPaymentStatus";
import { makeGroupMock } from "@/__tests__/factories/group";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import {
  makePaginatedPayments,
  makePaymentMock,
} from "@/__tests__/factories/payment";
import { makeUpcomingMatchMock } from "@/__tests__/factories/upcomingMatch";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const group = makeGroupMock({ id: "group-1", valuePerUser: 20 });
const paymentsUrl = `${API_URL}/groups/group-1/group-payments`;

function mockStatus({
  type = "MONTHLY",
  payments = [],
  pendingMatches = [],
  paymentsDelay = 0,
}: {
  type?: "MONTHLY" | "DAILY" | "OWNER";
  payments?: ReturnType<typeof makePaymentMock>[];
  pendingMatches?: ReturnType<typeof makeUpcomingMatchMock>[];
  paymentsDelay?: number;
} = {}) {
  const onFetchMine = vi.fn();
  server.use(
    http.get(`${API_URL}/groups/group-1`, () => HttpResponse.json(group)),
    http.get(`${API_URL}/groups/group-1/group-members`, () =>
      HttpResponse.json([makeGroupMemberMock({ userId: "user-logado", type })]),
    ),
    http.get(`${paymentsUrl}/me`, async ({ request }) => {
      onFetchMine(Object.fromEntries(new URL(request.url).searchParams));
      await delay(paymentsDelay);
      return HttpResponse.json(makePaginatedPayments(payments));
    }),
    http.get(`${paymentsUrl}/pending-matches`, () =>
      HttpResponse.json(pendingMatches),
    ),
  );
  return onFetchMine;
}

function renderStatus() {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(<MyPaymentStatus groupId="group-1" />);
  return { user, queryClient };
}

describe("MyPaymentStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-15T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  describe("monthly member", () => {
    it("should show nothing but a placeholder while loading", async () => {
      mockStatus({ paymentsDelay: 100 });

      renderStatus();

      expect(screen.queryByText(/Mensalidade de outubro/)).not.toBeInTheDocument();
      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
    });

    it("should ask for the current month's payments", async () => {
      const onFetchMine = mockStatus();

      renderStatus();

      await screen.findByText("Mensalidade de outubro pendente");
      expect(onFetchMine).toHaveBeenCalledWith(
        expect.objectContaining({ year: "2026", month: "10" }),
      );
    });

    it("should show the fee as paid with the amount and the day it was registered", async () => {
      mockStatus({
        payments: [makePaymentMock({ amount: 20, createdAt: "2026-10-05T15:00:00.000Z" })],
      });

      renderStatus();

      expect(await screen.findByText("Mensalidade de outubro paga")).toBeInTheDocument();
      expect(screen.getByText("R$ 20,00 · registrada em 05/10")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Registrar pagamento" }),
      ).not.toBeInTheDocument();
    });

    it("should show the fee as pending and offer to register the payment", async () => {
      mockStatus();

      renderStatus();

      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Você ainda não registrou o pagamento deste mês"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Registrar pagamento" }),
      ).toBeInTheDocument();
    });

    it("should not count a one-off match payment as the monthly fee", async () => {
      mockStatus({ payments: [makePaymentMock({ matchId: "match-1" })] });

      renderStatus();

      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
    });

    it("should treat the owner like a monthly member", async () => {
      mockStatus({ type: "OWNER" });

      renderStatus();

      expect(
        await screen.findByText("Mensalidade de outubro pendente"),
      ).toBeInTheDocument();
    });
  });

  describe("daily member", () => {
    it("should say nothing is pending when every match is paid", async () => {
      mockStatus({ type: "DAILY", pendingMatches: [] });

      renderStatus();

      expect(
        await screen.findByText("Nenhuma partida pendente de pagamento"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Registrar pagamento" }),
      ).not.toBeInTheDocument();
    });

    it.each([
      [1, "1 partida pendente de pagamento"],
      [3, "3 partidas pendentes de pagamento"],
    ])("should count %d pending match(es) in the singular or plural", async (count, title) => {
      mockStatus({
        type: "DAILY",
        pendingMatches: Array.from({ length: count }, (_, index) =>
          makeUpcomingMatchMock({ id: `match-${index}` }),
        ),
      });

      renderStatus();

      expect(await screen.findByText(title)).toBeInTheDocument();
      expect(
        screen.getByText("Partidas em que você jogou e ainda não pagou"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Registrar pagamento" }),
      ).toBeInTheDocument();
    });
  });

  describe("registering a monthly payment", () => {
    async function openForm() {
      const { user } = renderStatus();
      await user.click(
        await screen.findByRole("button", { name: "Registrar pagamento" }),
      );
      await screen.findByRole("dialog");
      await waitFor(() =>
        expect(screen.getByLabelText("Valor pago")).toHaveDisplayValue(/20/),
      );
      return user;
    }

    function mockCreate({
      status = 201,
      responseDelay = 0,
    }: { status?: number; responseDelay?: number } = {}) {
      const onCreate = vi.fn();
      server.use(
        http.post(paymentsUrl, async ({ request }) => {
          await delay(responseDelay);
          onCreate(await request.json());
          return HttpResponse.json(status === 201 ? makePaymentMock() : {}, { status });
        }),
      );
      return onCreate;
    }

    it("should open the form for the month with the group's value filled in", async () => {
      mockStatus();

      await openForm();

      const dialog = screen.getByRole("dialog");
      expect(
        within(dialog).getByRole("heading", { name: "Registrar pagamento" }),
      ).toBeInTheDocument();
      expect(within(dialog).getByText("Mensalidade de outubro")).toBeInTheDocument();
      expect(within(dialog).getByLabelText("Valor pago")).toHaveDisplayValue(/20/);
    });

    describe("when the group arrives after the form is open", () => {
      async function openFormWithSlowGroup() {
        mockStatus();
        server.use(
          http.get(`${API_URL}/groups/group-1`, async () => {
            await delay(150);
            return HttpResponse.json(group);
          }),
        );
        const { user } = renderStatus();
        await user.click(
          await screen.findByRole("button", { name: "Registrar pagamento" }),
        );
        await screen.findByRole("dialog");
        return user;
      }

      it("should fill the amount as soon as the group arrives", async () => {
        await openFormWithSlowGroup();
        expect(screen.getByLabelText("Valor pago")).toHaveDisplayValue("");

        await waitFor(() =>
          expect(screen.getByLabelText("Valor pago")).toHaveDisplayValue(/20/),
        );
      });

      it("should not erase what the user typed in the meantime", async () => {
        const user = await openFormWithSlowGroup();
        const receipt = screen.getByLabelText("Link do comprovante (opcional)");

        await user.type(receipt, "https://example.com/pix.png");
        await waitFor(() =>
          expect(screen.getByLabelText("Valor pago")).toHaveDisplayValue(/20/),
        );

        expect(receipt).toHaveValue("https://example.com/pix.png");
      });
    });

    it("should ask for a value when the amount is empty", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();

      await user.clear(screen.getByLabelText("Valor pago"));
      await user.click(screen.getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Informe o valor pago")).toBeInTheDocument();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should reject a value of zero", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();

      await user.clear(screen.getByLabelText("Valor pago"));
      await user.type(screen.getByLabelText("Valor pago"), "0");
      await user.click(screen.getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Informe um valor válido")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should reject a receipt that is not a link", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();

      await user.type(screen.getByLabelText("Link do comprovante (opcional)"), "comprovante");
      await user.click(screen.getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Informe um link válido")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should ask the user to confirm the declared amount before sending anything", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();

      await user.click(screen.getByRole("button", { name: "Registrar" }));

      const confirmation = await screen.findByRole("alertdialog", {
        name: "Registrar pagamento?",
      });
      expect(
        within(confirmation).getByText(
          "Você está declarando o pagamento de R$ 20,00. Essa declaração não pode ser desfeita.",
        ),
      ).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should keep the form open and send nothing when the user backs out of the confirmation", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();
      await user.click(screen.getByRole("button", { name: "Registrar" }));

      await user.click(await screen.findByRole("button", { name: "Cancelar" }));

      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should register the payment, close the form and show the fee as paid", async () => {
      let paid = false;
      mockStatus();
      server.use(
        http.get(`${paymentsUrl}/me`, () =>
          HttpResponse.json(
            makePaginatedPayments(paid ? [makePaymentMock({ amount: 20 })] : []),
          ),
        ),
      );
      const onCreate = vi.fn();
      server.use(
        http.post(paymentsUrl, async ({ request }) => {
          paid = true;
          onCreate(await request.json());
          return HttpResponse.json(makePaymentMock(), { status: 201 });
        }),
      );
      const user = await openForm();

      await user.click(screen.getByRole("button", { name: "Registrar" }));
      const confirmation = await screen.findByRole("alertdialog");
      await user.click(within(confirmation).getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Pagamento registrado")).toBeInTheDocument();
      expect(onCreate).toHaveBeenCalledExactlyOnceWith({ amount: 20 });
      expect(
        await screen.findByText("Mensalidade de outubro paga"),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("should send the receipt when the user fills it in", async () => {
      mockStatus();
      const onCreate = mockCreate();
      const user = await openForm();

      await user.type(
        screen.getByLabelText("Link do comprovante (opcional)"),
        "https://example.com/pix.png",
      );
      await user.click(screen.getByRole("button", { name: "Registrar" }));
      const confirmation = await screen.findByRole("alertdialog");
      await user.click(within(confirmation).getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Pagamento registrado")).toBeInTheDocument();
      expect(onCreate).toHaveBeenCalledWith({
        amount: 20,
        receipt: "https://example.com/pix.png",
      });
    });

    it("should lock the confirmation while the payment is being registered", async () => {
      mockStatus();
      mockCreate({ responseDelay: 100 });
      const user = await openForm();
      await user.click(screen.getByRole("button", { name: "Registrar" }));
      const confirmation = await screen.findByRole("alertdialog");

      await user.click(within(confirmation).getByRole("button", { name: "Registrar" }));

      expect(
        within(confirmation).getByRole("button", { name: "Aguarde..." }),
      ).toBeDisabled();
      expect(await screen.findByText("Pagamento registrado")).toBeInTheDocument();
    });

    it("should close the confirmation and show an error toast when the API fails", async () => {
      mockStatus();
      mockCreate({ status: 500 });
      const user = await openForm();
      await user.click(screen.getByRole("button", { name: "Registrar" }));
      const confirmation = await screen.findByRole("alertdialog");

      await user.click(within(confirmation).getByRole("button", { name: "Registrar" }));

      expect(
        await screen.findByText("Não foi possível registrar o pagamento. Tente novamente."),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("registering a payment for a match", () => {
    const pendingMatch = makeUpcomingMatchMock({
      id: "match-7",
      matchDate: "2026-10-02T22:30:00.000Z",
    });

    async function openForm() {
      const { user } = renderStatus();
      await user.click(
        await screen.findByRole("button", { name: "Registrar pagamento" }),
      );
      await screen.findByRole("dialog");
      await waitFor(() =>
        expect(screen.getByLabelText("Valor pago")).toHaveDisplayValue(/20/),
      );
      return user;
    }

    it("should describe a per-match payment and ask which match was paid", async () => {
      mockStatus({ type: "DAILY", pendingMatches: [pendingMatch] });

      await openForm();

      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Pagamento por partida")).toBeInTheDocument();
      expect(within(dialog).getByRole("combobox", { name: "Partida" })).toBeInTheDocument();
    });

    it("should require the match to be chosen", async () => {
      mockStatus({ type: "DAILY", pendingMatches: [pendingMatch] });
      const user = await openForm();

      await user.click(screen.getByRole("button", { name: "Registrar" }));

      expect(
        await screen.findByText("Selecione a partida", {
          selector: ".text-destructive",
        }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should send the chosen match with the payment", async () => {
      mockStatus({ type: "DAILY", pendingMatches: [pendingMatch] });
      const onCreate = vi.fn();
      server.use(
        http.post(paymentsUrl, async ({ request }) => {
          onCreate(await request.json());
          return HttpResponse.json(makePaymentMock({ matchId: "match-7" }), {
            status: 201,
          });
        }),
      );
      const user = await openForm();

      await user.click(screen.getByRole("combobox", { name: "Partida" }));
      await user.click(await screen.findByRole("option", { name: /sex.*02\/10.*19:30/i }));
      await user.click(screen.getByRole("button", { name: "Registrar" }));
      const confirmation = await screen.findByRole("alertdialog");
      await user.click(within(confirmation).getByRole("button", { name: "Registrar" }));

      expect(await screen.findByText("Pagamento registrado")).toBeInTheDocument();
      expect(onCreate).toHaveBeenCalledExactlyOnceWith({
        amount: 20,
        matchId: "match-7",
      });
    });
  });
});
