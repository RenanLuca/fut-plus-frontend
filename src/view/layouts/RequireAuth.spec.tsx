import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { RequireAuth } from "@/src/view/layouts/RequireAuth";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { queryKeys } from "@/src/app/lib/query-keys";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function ProtectedPage() {
  const { data } = useCurrentUser();
  return <p>{data ? `protected page of ${data.name}` : "protected page"}</p>;
}

function renderProtectedRoute({ authenticated = true } = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>login page</p>} />
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<ProtectedPage />} />
      </Route>
    </Routes>,
    { route: "/home", authenticated },
  );
}

describe("RequireAuth", () => {
  it("should redirect to the login page when there is no session", () => {
    renderProtectedRoute({ authenticated: false });

    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText(/protected page/)).not.toBeInTheDocument();
  });

  it("should render the protected page when the user is authenticated", async () => {
    renderProtectedRoute();

    expect(
      await screen.findByText("protected page of Renan de Luca"),
    ).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("should log out, warn the user and redirect when a later request answers 401", async () => {
    const { queryClient } = renderProtectedRoute();
    expect(
      await screen.findByText("protected page of Renan de Luca"),
    ).toBeInTheDocument();

    server.use(
      http.get(`${API_URL}/users/me`, () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );
    await queryClient.refetchQueries({ queryKey: queryKeys.me });

    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(
      await screen.findByText("Sua sessão expirou. Entre novamente."),
    ).toBeInTheDocument();
    await waitFor(() => expect(authTokenStorage.get()).toBeNull());
  });

  it("should log out when the very first request after load answers 401", async () => {
    server.use(
      http.get(`${API_URL}/users/me`, () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );

    renderProtectedRoute();

    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(
      await screen.findByText("Sua sessão expirou. Entre novamente."),
    ).toBeInTheDocument();
    await waitFor(() => expect(authTokenStorage.get()).toBeNull());
  });
});
