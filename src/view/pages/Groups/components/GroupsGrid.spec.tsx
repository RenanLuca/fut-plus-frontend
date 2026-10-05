import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { GroupsGrid } from "@/src/view/pages/Groups/components/GroupsGrid";
import { makeGroupMock } from "@/__tests__/factories/group";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

describe("GroupsGrid", () => {
  it("should show the loading placeholder and no groups while loading", () => {
    renderWithProviders(
      <GroupsGrid groups={[makeGroupMock()]} isLoading />,
    );

    expect(
      screen.getByRole("status", { name: "GroupGridLoading" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should invite the user to create a group when there are none", () => {
    renderWithProviders(<GroupsGrid groups={[]} isLoading={false} />);

    expect(
      screen.getByRole("status", { name: "GroupGridEmpty" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Você ainda não faz parte de nenhum grupo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Crie um grupo pra começar a organizar suas peladas"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should list one card per group, each one linking to its group", () => {
    const groups = [
      makeGroupMock({ id: "group-1", name: "Pelada de sexta" }),
      makeGroupMock({ id: "group-2", name: "Racha de domingo" }),
      makeGroupMock({ id: "group-3", name: "Society da firma" }),
    ];

    renderWithProviders(<GroupsGrid groups={groups} isLoading={false} />);

    const list = screen.getByRole("list", { name: "GroupGridList" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    const cards = within(list).getAllByRole("link");
    expect(cards).toHaveLength(3);
    expect(cards.map((card) => card.getAttribute("href"))).toEqual([
      "/groups/group-1",
      "/groups/group-2",
      "/groups/group-3",
    ]);
    expect(within(list).getByText("Racha de domingo")).toBeInTheDocument();
    expect(
      screen.queryByRole("status", { name: "GroupGridEmpty" }),
    ).not.toBeInTheDocument();
  });
});
