import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useCurrentUser } from "./useCurrentUser";
import { makeUserMock } from "@/__tests__/factories/user";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function CurrentUserProbe() {
  const { data, isLoading, isError } = useCurrentUser();
  if (isError) return <p>error</p>;
  if (isLoading) return <p>loading</p>;
  return <p>{data ? `user: ${data.name}` : "no user"}</p>;
}

describe("useCurrentUser", () => {
  it("should load the logged user from the API", async () => {
    renderWithProviders(<CurrentUserProbe />);

    expect(await screen.findByText("user: Renan de Luca")).toBeInTheDocument();
  });

  it("should not call the API while the user is logged out", async () => {
    const onRequest = vi.fn();
    server.use(
      http.get(`${API_URL}/users/me`, () => {
        onRequest();
        return HttpResponse.json(makeUserMock());
      }),
    );

    renderWithProviders(<CurrentUserProbe />, { authenticated: false });

    expect(screen.getByText("no user")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onRequest).not.toHaveBeenCalled();
  });

  it("should report an error when the API fails", async () => {
    server.use(
      http.get(`${API_URL}/users/me`, () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithProviders(<CurrentUserProbe />);

    expect(await screen.findByText("error")).toBeInTheDocument();
  });
});
