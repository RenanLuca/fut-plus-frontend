import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { VerifyEmailPage } from "@/src/view/pages/VerifyEmail";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function renderVerifyEmailPage(route = "/verify-email?token=token-123") {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>login page</p>} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>,
    { route, authenticated: false },
  );
}

function mockVerifyEmail({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onVerify = vi.fn();
  server.use(
    http.post(`${API_URL}/auth/verify-email`, async ({ request }) => {
      await delay(responseDelay);
      onVerify(await request.json());
      return HttpResponse.json({ message: "ok" }, { status });
    }),
  );
  return onVerify;
}

describe("VerifyEmail Page", () => {
  it("should show the invalid link screen when there is no token", () => {
    const onVerify = mockVerifyEmail();

    renderVerifyEmailPage("/verify-email");

    expect(
      screen.getByRole("heading", { name: "Link inválido" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o login" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(onVerify).not.toHaveBeenCalled();
  });

  it("should show the progress message while the token is being checked", async () => {
    mockVerifyEmail({ responseDelay: 100 });

    renderVerifyEmailPage();

    expect(
      screen.getByRole("heading", { name: "Confirmando seu email..." }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ir para o login" }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("should send the token once, show a toast and go to the login when it is valid", async () => {
    const onVerify = mockVerifyEmail();

    renderVerifyEmailPage();

    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(
      await screen.findByText("Email confirmado! Agora é só entrar."),
    ).toBeInTheDocument();
    expect(onVerify).toHaveBeenCalledExactlyOnceWith({ token: "token-123" });
  });

  it.each([400, 500])(
    "should show the invalid link screen when the API answers %i",
    async (status) => {
      mockVerifyEmail({ status });

      renderVerifyEmailPage();

      expect(
        await screen.findByRole("heading", { name: "Link inválido" }),
      ).toBeInTheDocument();
      expect(screen.queryByText("login page")).not.toBeInTheDocument();
    },
  );
});
