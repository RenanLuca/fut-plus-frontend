import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentRow } from "./PaymentRow";

describe("PaymentRow", () => {
  it("should show the title, the subtitle and the amount in reais", () => {
    render(
      <PaymentRow
        title="Mensalidade de outubro"
        subtitle="Registrado em 05/10"
        receipt={null}
        amount={1234.5}
      />,
    );

    expect(screen.getByText("Mensalidade de outubro")).toBeInTheDocument();
    expect(screen.getByText("Registrado em 05/10")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.234,50")).toBeInTheDocument();
  });

  it("should not show a receipt link when there is no receipt", () => {
    render(
      <PaymentRow title="Pagamento" subtitle="Registrado" receipt={null} amount={20} />,
    );

    expect(screen.queryByRole("link", { name: /Comprovante/ })).not.toBeInTheDocument();
  });

  it("should open the receipt in a new tab, safely", () => {
    render(
      <PaymentRow
        title="Pagamento"
        subtitle="Registrado"
        receipt="https://example.com/comprovante.png"
        amount={20}
      />,
    );

    const link = screen.getByRole("link", { name: "Comprovante" });
    expect(link).toHaveAttribute("href", "https://example.com/comprovante.png");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
