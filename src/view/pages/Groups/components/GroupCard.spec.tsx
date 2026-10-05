import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { GroupCard } from "@/src/view/pages/Groups/components/GroupCard";
import { makeGroupMock } from "@/__tests__/factories/group";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

describe("GroupCard", () => {
  it("should link to the group and show its name", () => {
    renderWithProviders(
      <GroupCard group={makeGroupMock({ id: "group-9", name: "Racha de domingo" })} />,
    );

    expect(
      screen.getByRole("link", { name: /Racha de domingo/ }),
    ).toHaveAttribute("href", "/groups/group-9");
  });

  it.each([
    [{ weekday: "FRIDAY", hour: "20:00" }, "Sexta, 20:00"],
    [{ weekday: "SATURDAY", hour: "09:30" }, "Sábado, 09:30"],
    [{ weekday: "SUNDAY", hour: "18:00" }, "Domingo, 18:00"],
  ] as const)("should show the schedule %o as '%s'", (schedule, text) => {
    renderWithProviders(<GroupCard group={makeGroupMock(schedule)} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it.each([
    ["EVENTUAL", "Eventual"],
    ["MONTHLY", "Mensal"],
  ] as const)("should show the %s frequency as '%s'", (frequency, text) => {
    renderWithProviders(<GroupCard group={makeGroupMock({ frequency })} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it.each([
    [20, "R$ 20,00 por pessoa"],
    [1234.5, "R$ 1.234,50 por pessoa"],
  ])("should show the value %d as '%s'", (valuePerUser, text) => {
    renderWithProviders(<GroupCard group={makeGroupMock({ valuePerUser })} />);

    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
