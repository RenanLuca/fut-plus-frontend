import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordRequirements } from "./PasswordRequirements";

const MET = "text-green-600";

function requirement(label: string) {
  return screen.getByText(label).closest("li") as HTMLElement;
}

describe("PasswordRequirements", () => {
  it("should render nothing while the password is empty", () => {
    const { container } = render(<PasswordRequirements password="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should list the four requirements as soon as there is a password", () => {
    render(<PasswordRequirements password="a" />);

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Mínimo de 8 caracteres")).toBeInTheDocument();
    expect(screen.getByText("Uma letra maiúscula")).toBeInTheDocument();
    expect(screen.getByText("Um número")).toBeInTheDocument();
    expect(screen.getByText("Um símbolo (ex: ! @ #)")).toBeInTheDocument();
  });

  it.each([
    ["abc", []],
    ["abcdefgh", ["Mínimo de 8 caracteres"]],
    ["Abc", ["Uma letra maiúscula"]],
    ["abc1", ["Um número"]],
    ["abc!", ["Um símbolo (ex: ! @ #)"]],
    [
      "Abcdef1!",
      [
        "Mínimo de 8 caracteres",
        "Uma letra maiúscula",
        "Um número",
        "Um símbolo (ex: ! @ #)",
      ],
    ],
  ])("should mark the requirements met by '%s'", (password, met) => {
    render(<PasswordRequirements password={password} />);

    [
      "Mínimo de 8 caracteres",
      "Uma letra maiúscula",
      "Um número",
      "Um símbolo (ex: ! @ #)",
    ].forEach((label) => {
      if (met.includes(label)) expect(requirement(label)).toHaveClass(MET);
      else expect(requirement(label)).not.toHaveClass(MET);
    });
  });
});
