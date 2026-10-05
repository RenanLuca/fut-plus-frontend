import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerMoveMenu } from "./PlayerMoveMenu";
import { makeTeamMock } from "@/__tests__/factories/matchTeam";

const teamA = makeTeamMock({ id: "team-a", name: "Time A" });
const teamB = makeTeamMock({ id: "team-b", name: "Time B" });
const teamC = makeTeamMock({ id: "team-c", name: "Time C" });
const player = { id: "user-2", isGuest: false };

function renderMenu({
  currentTeamId = "team-a" as string | null,
  disabled = false,
} = {}) {
  const onMove = vi.fn();
  const user = userEvent.setup();
  render(
    <PlayerMoveMenu
      player={player}
      currentTeamId={currentTeamId}
      teams={[teamA, teamB, teamC]}
      onMove={onMove}
      disabled={disabled}
    >
      Carlos
    </PlayerMoveMenu>,
  );
  return { user, onMove };
}

describe("PlayerMoveMenu", () => {
  it("should show the player as the button that opens the menu", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: "Carlos" })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should offer every other team and a way to leave the current one", async () => {
    const { user } = renderMenu({ currentTeamId: "team-a" });

    await user.click(screen.getByRole("button", { name: "Carlos" }));

    expect(
      await screen.findByRole("menuitem", { name: "Mover para Time B" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Mover para Time C" })).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Mover para Time A" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Tirar do time" })).toBeInTheDocument();
  });

  it("should not offer to leave a team when the player has none", async () => {
    const { user } = renderMenu({ currentTeamId: null });

    await user.click(screen.getByRole("button", { name: "Carlos" }));

    expect(
      await screen.findByRole("menuitem", { name: "Mover para Time A" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    expect(
      screen.queryByRole("menuitem", { name: "Tirar do time" }),
    ).not.toBeInTheDocument();
  });

  it("should move the player to the chosen team", async () => {
    const { user, onMove } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Carlos" }));
    await user.click(await screen.findByRole("menuitem", { name: "Mover para Time C" }));

    expect(onMove).toHaveBeenCalledExactlyOnceWith(player, "team-c");
  });

  it("should take the player out of the team", async () => {
    const { user, onMove } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Carlos" }));
    await user.click(await screen.findByRole("menuitem", { name: "Tirar do time" }));

    expect(onMove).toHaveBeenCalledExactlyOnceWith(player, null);
  });

  it("should not open while a move is in progress", async () => {
    const { user } = renderMenu({ disabled: true });

    const trigger = screen.getByRole("button", { name: "Carlos" });
    await user.click(trigger);

    expect(trigger).toBeDisabled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
