import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("should start hiding the password under its label", () => {
    render(<PasswordInput id="password" label="Senha" />);

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("should show and hide the password when the user toggles", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="password" label="Senha" />);

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  });

  it("should keep what the user typed when toggling", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="password" label="Senha" />);
    await user.type(screen.getByLabelText("Senha"), "Segredo@1");

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(screen.getByLabelText("Senha")).toHaveValue("Segredo@1");
  });

  it("should not take the focus away from the field when toggling", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="password" label="Senha" />);
    const input = screen.getByLabelText("Senha");
    await user.click(input);

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(input).toHaveFocus();
  });

  it("should not submit the form when the user toggles the visibility", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    );
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput id="password" label="Senha" />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should pass the extra props down to the field", () => {
    render(
      <PasswordInput id="password" label="Senha" placeholder="Sua senha" aria-invalid />,
    );

    const input = screen.getByLabelText("Senha");
    expect(input).toHaveAttribute("placeholder", "Sua senha");
    expect(input).toBeInvalid();
  });
});
