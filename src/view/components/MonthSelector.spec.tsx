import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthSelector } from "./MonthSelector";

describe("MonthSelector", () => {
  it("should write the selected month and year in Portuguese", () => {
    render(
      <MonthSelector
        value={{ year: 2026, month: 3 }}
        max={{ year: 2026, month: 10 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("março de 2026")).toBeInTheDocument();
  });

  it("should go to the previous month", async () => {
    const onChange = vi.fn();
    render(
      <MonthSelector
        value={{ year: 2026, month: 3 }}
        max={{ year: 2026, month: 10 }}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith({ year: 2026, month: 2 });
  });

  it("should cross the year when going back from January", async () => {
    const onChange = vi.fn();
    render(
      <MonthSelector
        value={{ year: 2026, month: 1 }}
        max={{ year: 2026, month: 10 }}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }));

    expect(onChange).toHaveBeenCalledWith({ year: 2025, month: 12 });
  });

  it("should go to the next month while it is before the limit", async () => {
    const onChange = vi.fn();
    render(
      <MonthSelector
        value={{ year: 2026, month: 9 }}
        max={{ year: 2026, month: 10 }}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Próximo mês" }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith({ year: 2026, month: 10 });
  });

  it("should not let the user go past the limit month", async () => {
    const onChange = vi.fn();
    render(
      <MonthSelector
        value={{ year: 2026, month: 10 }}
        max={{ year: 2026, month: 10 }}
        onChange={onChange}
      />,
    );

    const next = screen.getByRole("button", { name: "Próximo mês" });
    await userEvent.click(next);

    expect(next).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Mês anterior" })).toBeEnabled();
  });
});
