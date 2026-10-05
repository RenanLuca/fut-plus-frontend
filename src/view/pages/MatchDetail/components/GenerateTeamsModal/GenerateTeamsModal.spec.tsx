import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { GenerateTeamsModal } from "@/src/view/pages/MatchDetail/components/GenerateTeamsModal";
import { queryKeys } from "@/src/app/lib/query-keys";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const generateUrl = `${API_URL}/groups/group-1/group-matches/match-1/match-teams/generate`;

function mockGenerate({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onGenerate = vi.fn();
  server.use(
    http.post(generateUrl, async ({ request }) => {
      await delay(responseDelay);
      onGenerate(await request.json());
      return HttpResponse.json(status === 201 ? [] : {}, { status });
    }),
  );
  return onGenerate;
}

function renderModal({ hasTeams = false, confirmedCount = 12 } = {}) {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <GenerateTeamsModal
      groupId="group-1"
      matchId="match-1"
      hasTeams={hasTeams}
      confirmedCount={confirmedCount}
    />,
  );
  return { user, queryClient };
}

async function openForm(options?: Parameters<typeof renderModal>[0]) {
  const { user, queryClient } = renderModal(options);
  await user.click(
    screen.getByRole("button", { name: options?.hasTeams ? "Gerar novamente" : "Gerar times" }),
  );
  await screen.findByRole("dialog");
  return { user, queryClient };
}

const submit = () =>
  within(screen.getByRole("dialog")).getByRole("button", { name: "Gerar" });

async function setPlayersPerTeam(user: ReturnType<typeof userEvent.setup>, value: string) {
  const input = screen.getByLabelText("Jogadores por time");
  await user.clear(input);
  if (value) await user.type(input, value);
}

describe("GenerateTeamsModal", () => {
  describe("trigger and texts", () => {
    it("should offer to generate the first teams", async () => {
      await openForm({ hasTeams: false });

      expect(
        screen.getByText("Distribui os jogadores confirmados em times balanceados"),
      ).toBeInTheDocument();
    });

    it("should offer to generate again and warn it replaces the current teams", async () => {
      await openForm({ hasTeams: true });

      expect(
        screen.getByText(
          "Isso substitui os times atuais, sorteando de novo entre os confirmados",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("team estimate", () => {
    it("should start with 5 players per team and estimate the number of teams", async () => {
      await openForm({ confirmedCount: 12 });

      expect(screen.getByLabelText("Jogadores por time")).toHaveValue(5);
      expect(screen.getByText("Isso vai gerar: 2 times")).toBeInTheDocument();
    });

    it("should update the estimate as the user changes the size", async () => {
      const { user } = await openForm({ confirmedCount: 12 });

      await setPlayersPerTeam(user, "3");

      expect(screen.getByText("Isso vai gerar: 4 times")).toBeInTheDocument();
    });
  });

  describe("impossible sizes", () => {
    it("should say the maximum and block the submit when there are too few players", async () => {
      await openForm({ confirmedCount: 6 });

      expect(
        screen.getByText("Com 6 confirmados, o máximo é 3 jogadores por time"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Isso vai gerar/)).not.toBeInTheDocument();
      expect(submit()).toBeDisabled();
    });

    it("should unblock the submit once the size fits", async () => {
      const { user } = await openForm({ confirmedCount: 6 });

      await setPlayersPerTeam(user, "3");

      expect(screen.getByText("Isso vai gerar: 2 times")).toBeInTheDocument();
      expect(submit()).toBeEnabled();
    });

    it("should say two teams cannot be formed when there are fewer than two players", async () => {
      await openForm({ confirmedCount: 1 });

      expect(
        screen.getByText("Confirmados insuficientes para formar 2 times"),
      ).toBeInTheDocument();
      expect(submit()).toBeDisabled();
    });
  });

  describe("form validation", () => {
    it("should ask for the size when it is empty", async () => {
      const onGenerate = mockGenerate();
      const { user } = await openForm();

      await setPlayersPerTeam(user, "");
      await user.click(submit());

      expect(
        await screen.findByText("Informe a quantidade de jogadores por time"),
      ).toBeInTheDocument();
      expect(onGenerate).not.toHaveBeenCalled();
    });

    it("should block a size below one before anything is sent", async () => {
      const onGenerate = mockGenerate();
      const { user } = await openForm();

      await setPlayersPerTeam(user, "0");
      await user.click(submit());

      // o min="1" do campo faz o próprio navegador barrar o envio
      expect(screen.getByLabelText("Jogadores por time")).toBeInvalid();
      expect(onGenerate).not.toHaveBeenCalled();
    });
  });

  describe("generating", () => {
    it("should send the size as a number, refresh the teams, show a toast and close", async () => {
      const onGenerate = mockGenerate();
      const { user, queryClient } = await openForm({ confirmedCount: 12 });
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

      await setPlayersPerTeam(user, "4");
      await user.click(submit());

      expect(await screen.findByText("Times gerados!")).toBeInTheDocument();
      expect(onGenerate).toHaveBeenCalledExactlyOnceWith({ playersPerTeam: 4 });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.matchTeams("group-1", "match-1"),
      });
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("should disable the button while the teams are being generated", async () => {
      mockGenerate({ responseDelay: 100 });
      const { user } = await openForm();

      await user.click(submit());

      expect(
        within(screen.getByRole("dialog")).getByRole("button", { name: "Gerando..." }),
      ).toBeDisabled();
      expect(await screen.findByText("Times gerados!")).toBeInTheDocument();
    });

    it("should explain when the API says there are too few confirmed players", async () => {
      mockGenerate({ status: 400 });
      const { user } = await openForm();

      await user.click(submit());

      expect(
        await screen.findByText("Poucos jogadores confirmados pra esse tamanho de time."),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show a generic error toast on any other failure", async () => {
      mockGenerate({ status: 500 });
      const { user } = await openForm();

      await user.click(submit());

      expect(
        await screen.findByText("Não foi possível gerar os times. Tente novamente."),
      ).toBeInTheDocument();
    });

    it("should start from 5 again when the form is reopened", async () => {
      const { user } = await openForm();
      await setPlayersPerTeam(user, "3");
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Gerar times" }));

      expect(await screen.findByLabelText("Jogadores por time")).toHaveValue(5);
    });
  });
});
