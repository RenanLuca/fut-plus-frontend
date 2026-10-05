import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamCard } from "./TeamCard";
import { makeTeamMock } from "@/__tests__/factories/matchTeam";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const teamA = makeTeamMock({
  id: "team-a",
  name: "Time A",
  players: [
    { id: "user-1", name: "Renan", position: "GOALKEEPER" },
    { id: "user-2", name: "Carlos", position: "STRIKER" },
    { id: "guest-1", name: "Visitante", isGuest: true },
  ],
});
const teamB = makeTeamMock({ id: "team-b", name: "Time B" });

function renderCard({ isOwner = false, team = teamA, isMovingPlayer = false } = {}) {
  const onMovePlayer = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(
    <TeamCard
      team={team}
      teams={[teamA, teamB]}
      groupId="group-1"
      matchId="match-1"
      isOwner={isOwner}
      onMovePlayer={onMovePlayer}
      isMovingPlayer={isMovingPlayer}
    />,
  );
  return { user, onMovePlayer };
}

describe("TeamCard", () => {
  it("should show the team name, the player count and every player", () => {
    renderCard();

    expect(screen.getByText("Time A")).toBeInTheDocument();
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(screen.getByText("Renan")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Visitante")).toBeInTheDocument();
    expect(screen.getByText("Convidado")).toBeInTheDocument();
  });

  it("should say the team has no players when it is empty", () => {
    renderCard({ team: teamB });

    expect(screen.getByText("(0)")).toBeInTheDocument();
    expect(screen.getByText("Sem jogadores")).toBeInTheDocument();
  });

  describe("for a regular member", () => {
    it("should be read-only", () => {
      renderCard({ isOwner: false });

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("for the owner", () => {
    it("should offer to edit the team", () => {
      renderCard({ isOwner: true });

      expect(screen.getByRole("button", { name: "Editar Time A" })).toBeInTheDocument();
    });

    it("should open the edit form with the team data", async () => {
      const { user } = renderCard({ isOwner: true });

      await user.click(screen.getByRole("button", { name: "Editar Time A" }));

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Editar time" })).toBeInTheDocument();
      expect(screen.getByLabelText("Nome")).toHaveValue("Time A");
    });

    it("should let the owner move a player to another team", async () => {
      const { user, onMovePlayer } = renderCard({ isOwner: true });

      await user.click(screen.getByRole("button", { name: /Carlos/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Mover para Time B" }));

      expect(onMovePlayer).toHaveBeenCalledExactlyOnceWith(
        { id: "user-2", isGuest: false },
        "team-b",
      );
    });

    it("should identify a guest by the guest id when moving", async () => {
      const { user, onMovePlayer } = renderCard({ isOwner: true });

      await user.click(screen.getByRole("button", { name: /Visitante/ }));
      await user.click(await screen.findByRole("menuitem", { name: "Tirar do time" }));

      expect(onMovePlayer).toHaveBeenCalledExactlyOnceWith(
        { id: "guest-1", isGuest: true },
        null,
      );
    });

    it("should lock the players while a move is in progress", () => {
      renderCard({ isOwner: true, isMovingPlayer: true });

      expect(screen.getByRole("button", { name: /Carlos/ })).toBeDisabled();
    });
  });
});
