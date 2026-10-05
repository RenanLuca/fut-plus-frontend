import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mail } from "lucide-react";
import { Input } from "./input";

describe("Input", () => {
  it("should tie the label to the field", () => {
    render(<Input id="email" label="Email" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("should not render a label when none is given", () => {
    const { container } = render(<Input id="email" aria-label="Email" />);

    expect(container.querySelector("label")).not.toBeInTheDocument();
  });

  it("should let the user type", async () => {
    render(<Input id="name" label="Nome" />);

    await userEvent.type(screen.getByLabelText("Nome"), "Renan");

    expect(screen.getByLabelText("Nome")).toHaveValue("Renan");
  });

  it("should pass the native attributes down", () => {
    render(
      <Input
        id="hour"
        label="Horário"
        type="time"
        placeholder="00:00"
        disabled
        aria-invalid
      />,
    );

    const input = screen.getByLabelText("Horário");
    expect(input).toHaveAttribute("type", "time");
    expect(input).toHaveAttribute("placeholder", "00:00");
    expect(input).toBeDisabled();
    expect(input).toBeInvalid();
  });

  it("should show the icon and the end adornment", () => {
    const { container } = render(
      <Input
        id="email"
        label="Email"
        icon={Mail}
        endAdornment={<button type="button">limpar</button>}
      />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "limpar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveClass("pl-9");
  });
});
