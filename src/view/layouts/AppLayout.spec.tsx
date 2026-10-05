import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { AppLayout } from "@/src/view/layouts/AppLayout";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { makeUserMock } from "@/__tests__/factories/user";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function renderAppLayout(route = "/home") {
  const user = userEvent.setup();
  renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/home" element={<p>home content</p>} />
        <Route path="/groups" element={<p>groups content</p>} />
        <Route path="/profile" element={<p>profile content</p>} />
      </Route>
    </Routes>,
    { route },
  );
  return user;
}

describe("AppLayout", () => {
  it("should render the page of the current route", () => {
    renderAppLayout("/groups");

    expect(screen.getByText("groups content")).toBeInTheDocument();
    expect(screen.queryByText("home content")).not.toBeInTheDocument();
  });

  describe("navigation", () => {
    it.each([
      ["Home", "/home"],
      ["Grupos", "/groups"],
      ["Perfil", "/profile"],
    ])("should link '%s' to %s in both the sidebar and the bottom bar", (label, path) => {
      renderAppLayout();

      const links = screen.getAllByRole("link", { name: label });
      expect(links).toHaveLength(2);
      links.forEach((link) => expect(link).toHaveAttribute("href", path));
    });

    it("should mark only the current section as active", () => {
      renderAppLayout("/groups");

      screen.getAllByRole("link", { name: "Grupos" }).forEach((link) =>
        expect(link).toHaveAttribute("aria-current", "page"),
      );
      screen.getAllByRole("link", { name: "Home" }).forEach((link) =>
        expect(link).not.toHaveAttribute("aria-current"),
      );
    });

    it("should change the page and the active section when the user clicks a link", async () => {
      const user = renderAppLayout("/home");

      await user.click(screen.getAllByRole("link", { name: "Perfil" })[0]);

      expect(await screen.findByText("profile content")).toBeInTheDocument();
      screen.getAllByRole("link", { name: "Perfil" }).forEach((link) =>
        expect(link).toHaveAttribute("aria-current", "page"),
      );
    });
  });

  describe("header", () => {
    it("should show the logo for the light and dark themes", () => {
      renderAppLayout();

      expect(screen.getAllByAltText("Fut+")).toHaveLength(2);
    });

    it("should show a question mark while the user is loading", async () => {
      server.use(
        http.get(`${API_URL}/users/me`, async () => {
          await delay(100);
          return HttpResponse.json(makeUserMock());
        }),
      );

      renderAppLayout();

      expect(screen.getByText("?")).toBeInTheDocument();
      expect(await screen.findByText("RD")).toBeInTheDocument();
    });

    it("should show the user name, email and initials", async () => {
      renderAppLayout();

      expect(await screen.findByText("Renan de Luca")).toBeInTheDocument();
      expect(screen.getByText("renan@gmail.com")).toBeInTheDocument();
      expect(screen.getByText("RD")).toBeInTheDocument();
      expect(screen.queryByText("?")).not.toBeInTheDocument();
    });

    it("should clear the session when the user leaves", async () => {
      const user = renderAppLayout();
      expect(authTokenStorage.get()).not.toBeNull();

      await user.click(screen.getByRole("button", { name: "Sair" }));

      await waitFor(() => expect(authTokenStorage.get()).toBeNull());
    });
  });
});
