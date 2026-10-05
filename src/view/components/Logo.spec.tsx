import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("should expose a single accessible image named after the brand", () => {
    render(<Logo />);

    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Fut+" })).toBeInTheDocument();
  });

  it("should render both versions, one for each theme", () => {
    const { container } = render(<Logo />);

    const [light, dark] = Array.from(container.querySelectorAll("img"));
    expect(light).toHaveClass("dark:hidden");
    expect(dark).toHaveClass("hidden", "dark:block");
    expect(dark).toHaveAttribute("aria-hidden", "true");
  });

  it("should apply the className to both images and the wrapperClassName to the wrapper", () => {
    const { container } = render(
      <Logo className="w-24" wrapperClassName="md:hidden" />,
    );

    expect(container.firstElementChild).toHaveClass("flex", "md:hidden");
    container
      .querySelectorAll("img")
      .forEach((image) => expect(image).toHaveClass("w-24"));
  });
});
