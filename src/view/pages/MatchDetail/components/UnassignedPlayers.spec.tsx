import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnassignedPlayers } from "./UnassignedPlayers";
import { makeMemberMock } from "@/__tests__/factories/matchPresences";
import { makeTeamMock } from "@/__tests__/factories/matchTeam";

const players = [
  makeMemberMock({ id: "user-2", name: "Carlos" }),
  makeMemberMock({ id: "guest-1", name: "Visitante", isGuest: true }),
];
const teams = [
  makeTeamMock({ id: "team-a", name: "Time A" }),
  makeTeamMock({ id: "team-b", name: "Time B" }),
];

function renderUnassigned({ isOwner = false, isMovingPlayer = false } = {}) {
  const onMovePlayer = vi.fn();
  const user = userEvent.setup();
  render(
    <UnassignedPlayers
      players={players}
      teams={teams}
      isOwner={isOwner}
      onMovePlayer={onMovePlayer}
      isMovingPlayer={isMovingPlayer}
    />,
  );
  return { user, onMovePlayer };
}

describe("UnassignedPlayers", () => {
  it("should count and list the confirmed players that have no team", () => {
    renderUnassigned();

    expect(screen.getByText("Sem time (2)")).toBeInTheDocument();
    expect(
      screen.getByText("Confirmados que ainda não estão em nenhum time"),
    ).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Visitante")).toBeInTheDocument();
    expect(screen.getByText("Convidado")).toBeInTheDocument();
  });

  it("should be read-only for a regular member", () => {
    renderUnassigned({ isOwner: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should let the owner put a player in any team, but not take them out of one", async () => {
    const { user } = renderUnassigned({ isOwner: true });

    await user.click(screen.getByRole("button", { name: /Carlos/ }));

    expect(await screen.findByRole("menuitem", { name: "Mover para Time A" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Mover para Time B" })).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Tirar do time" }),
    ).not.toBeInTheDocument();
  });

  it("should move the player to the chosen team", async () => {
    const { user, onMovePlayer } = renderUnassigned({ isOwner: true });

    await user.click(screen.getByRole("button", { name: /Carlos/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Mover para Time B" }));

    expect(onMovePlayer).toHaveBeenCalledExactlyOnceWith(
      { id: "user-2", isGuest: false },
      "team-b",
    );
  });

  it("should move a guest identified as a guest", async () => {
    const { user, onMovePlayer } = renderUnassigned({ isOwner: true });

    await user.click(screen.getByRole("button", { name: /Visitante/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Mover para Time A" }));

    expect(onMovePlayer).toHaveBeenCalledExactlyOnceWith(
      { id: "guest-1", isGuest: true },
      "team-a",
    );
  });

  it("should lock the players while a move is in progress", () => {
    renderUnassigned({ isOwner: true, isMovingPlayer: true });

    expect(screen.getByRole("button", { name: /Carlos/ })).toBeDisabled();
  });
});
