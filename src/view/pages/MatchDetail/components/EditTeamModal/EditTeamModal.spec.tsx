import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { EditTeamModal } from "@/src/view/pages/MatchDetail/components/EditTeamModal";
import { queryKeys } from "@/src/app/lib/query-keys";
import { makeTeamMock } from "@/__tests__/factories/matchTeam";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const teamUrl = `${API_URL}/groups/group-1/group-matches/match-1/match-teams/team-1`;

function mockUpdateTeam({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onUpdate = vi.fn();
  server.use(
    http.patch(teamUrl, async ({ request }) => {
      await delay(responseDelay);
      onUpdate(await request.json());
      return HttpResponse.json(status === 200 ? makeTeamMock() : {}, { status });
    }),
  );
  return onUpdate;
}

function renderModal(team = makeTeamMock({ id: "team-1", name: "Time A", color: "#FF0000" })) {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  const { queryClient } = renderWithProviders(
    <EditTeamModal
      groupId="group-1"
      matchId="match-1"
      team={team}
      open
      onOpenChange={onOpenChange}
    />,
  );
  return { user, onOpenChange, queryClient };
}

describe("EditTeamModal", () => {
  it("should open with the team name and color selected", async () => {
    renderModal();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar time" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Time A");
    expect(screen.getByRole("radio", { name: "Vermelho" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Azul" })).not.toBeChecked();
  });

  it("should recognize the team color regardless of letter case", async () => {
    renderModal(makeTeamMock({ id: "team-1", color: "#0000ff" }));

    expect(await screen.findByRole("radio", { name: "Azul" })).toBeChecked();
  });

  it("should offer the six shirt colors", async () => {
    renderModal();

    await screen.findByRole("dialog");
    expect(
      screen.getAllByRole("radio").map((radio) => radio.getAttribute("aria-label")),
    ).toEqual(["Branco", "Preto", "Vermelho", "Azul", "Amarelo", "Verde"]);
  });

  describe("form validation", () => {
    it("should not accept an empty name", async () => {
      const onUpdate = mockUpdateTeam();
      const { user } = renderModal();
      await user.clear(await screen.findByLabelText("Nome"));

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("Informe o nome do time")).toBeInTheDocument();
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("should not accept a name with only spaces", async () => {
      const onUpdate = mockUpdateTeam();
      const { user } = renderModal();
      const name = await screen.findByLabelText("Nome");
      await user.clear(name);
      await user.type(name, "   ");

      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("Informe o nome do time")).toBeInTheDocument();
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("should ask for a color when the team has one that is not on the list", async () => {
      const onUpdate = mockUpdateTeam();
      const { user } = renderModal(makeTeamMock({ id: "team-1", color: "#123456" }));

      await user.click(await screen.findByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("Escolha a cor do time")).toBeInTheDocument();
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("saving", () => {
    it("should send the new name and color, refresh the teams and close", async () => {
      const onUpdate = mockUpdateTeam();
      const { user, onOpenChange, queryClient } = renderModal();
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
      const name = await screen.findByLabelText("Nome");

      await user.clear(name);
      await user.type(name, "  Os Azuis ");
      await user.click(screen.getByRole("radio", { name: "Azul" }));
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("Time atualizado")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
        name: "Os Azuis",
        color: "#0000FF",
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.matchTeams("group-1", "match-1"),
      });
    });

    it("should disable the button while the team is being saved", async () => {
      mockUpdateTeam({ responseDelay: 100 });
      const { user } = renderModal();

      await user.click(await screen.findByRole("button", { name: "Salvar" }));

      expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
      expect(await screen.findByText("Time atualizado")).toBeInTheDocument();
    });

    it("should keep the form open and show an error toast when the API fails", async () => {
      mockUpdateTeam({ status: 500 });
      const { user, onOpenChange } = renderModal();

      await user.click(await screen.findByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("Não foi possível atualizar o time. Tente novamente."),
      ).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
    });
  });
});
