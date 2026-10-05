import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerIdentity } from "./PlayerIdentity";

describe("PlayerIdentity", () => {
  it("should show the player name and initials", () => {
    render(
      <PlayerIdentity
        name="Renan de Luca"
        profilePicture={null}
        isGuest={false}
        position="DEFENDER"
        rank="BALLON_DOR"
      />,
    );

    expect(screen.getByText("Renan de Luca")).toBeInTheDocument();
    expect(screen.getByText("RD")).toBeInTheDocument();
  });

  it("should mark a guest", () => {
    render(
      <PlayerIdentity
        name="Visitante"
        profilePicture={null}
        isGuest
        position="STRIKER"
        rank="BRASILEIRAO"
      />,
    );

    expect(screen.getByText("Convidado")).toBeInTheDocument();
  });

  it("should not mark a regular member as a guest", () => {
    render(
      <PlayerIdentity
        name="Carlos"
        profilePicture={null}
        isGuest={false}
        position="GOALKEEPER"
      />,
    );

    expect(screen.queryByText("Convidado")).not.toBeInTheDocument();
  });

  it("should work for a player without a rank", () => {
    render(
      <PlayerIdentity
        name="Sem Nível"
        profilePicture={null}
        isGuest={false}
        position="WINGER"
        rank={null}
      />,
    );

    expect(screen.getByText("Sem Nível")).toBeInTheDocument();
  });
});
