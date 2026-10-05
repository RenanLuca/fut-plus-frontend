import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { useResendVerification } from "./useResendVerification";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function ResendProbe() {
  const { resend, isResending } = useResendVerification();
  return (
    <button onClick={() => resend("renan@gmail.com")}>
      {isResending ? "resending" : "resend"}
    </button>
  );
}

function mockResend({
  status = 204,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onResend = vi.fn();
  server.use(
    http.post(`${API_URL}/auth/resend-verification`, async ({ request }) => {
      await delay(responseDelay);
      onResend(await request.json());
      return new HttpResponse(null, { status });
    }),
  );
  return onResend;
}

describe("useResendVerification", () => {
  it("should send the email and tell the user, without revealing if the account exists", async () => {
    const onResend = mockResend();
    renderWithProviders(<ResendProbe />, { authenticated: false });

    await userEvent.click(screen.getByRole("button", { name: "resend" }));

    expect(
      await screen.findByText("Se o email existir, enviamos um novo link de verificação."),
    ).toBeInTheDocument();
    expect(onResend).toHaveBeenCalledExactlyOnceWith({ email: "renan@gmail.com" });
  });

  it("should report that it is resending while the request runs", async () => {
    mockResend({ responseDelay: 100 });
    renderWithProviders(<ResendProbe />, { authenticated: false });

    await userEvent.click(screen.getByRole("button", { name: "resend" }));

    expect(screen.getByRole("button", { name: "resending" })).toBeInTheDocument();
    expect(
      await screen.findByText("Se o email existir, enviamos um novo link de verificação."),
    ).toBeInTheDocument();
  });

  it.each([
    [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
    [500, "Não foi possível reenviar. Tente novamente."],
  ])("should show the right toast on a %i response", async (status, message) => {
    mockResend({ status });
    renderWithProviders(<ResendProbe />, { authenticated: false });

    await userEvent.click(screen.getByRole("button", { name: "resend" }));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
