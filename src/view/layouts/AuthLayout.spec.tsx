import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import { AuthLayout } from "@/src/view/layouts/AuthLayout";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function renderAuthLayout() {
  return renderWithProviders(
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<p>auth page content</p>} />
      </Route>
    </Routes>,
    { authenticated: false },
  );
}

describe("AuthLayout", () => {
  it("should render the page of the current route", () => {
    renderAuthLayout();

    expect(screen.getByText("auth page content")).toBeInTheDocument();
  });

  it("should show the brand and the tagline", () => {
    renderAuthLayout();

    expect(
      screen.getByText("A sua pelada de sempre, organizada como nunca!"),
    ).toBeInTheDocument();
    expect(screen.getAllByAltText("Fut+").length).toBeGreaterThan(0);
  });
});
