import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { ForgotPasswordPage } from "@/src/view/pages/ForgotPassword";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const email = "renan@gmail.com";

function mockForgotPassword({
  status = 204,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onRequest = vi.fn();
  server.use(
    http.post(`${API_URL}/auth/forgot-password`, async ({ request }) => {
      await delay(responseDelay);
      onRequest(await request.json());
      return new HttpResponse(null, { status });
    }),
  );
  return onRequest;
}

async function submitEmail(value = email) {
  const user = userEvent.setup();
  renderWithProviders(<ForgotPasswordPage />, { authenticated: false });
  if (value) await user.type(screen.getByLabelText("Email"), value);
  await user.click(screen.getByRole("button", { name: "Enviar link" }));
}

describe("ForgotPassword Page", () => {
  it("should ask for the email and offer a way back to the login", () => {
    renderWithProviders(<ForgotPasswordPage />, { authenticated: false });

    expect(
      screen.getByRole("heading", { name: "Esqueceu a senha?" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para o login" }),
    ).toHaveAttribute("href", "/");
  });

  describe("form validation", () => {
    it("should ask for the email and not call the API when it is empty", async () => {
      const onRequest = mockForgotPassword();

      await submitEmail("");

      expect(await screen.findByText("Informe o email")).toBeInTheDocument();
      expect(onRequest).not.toHaveBeenCalled();
    });

    it("should reject an invalid email", async () => {
      const onRequest = mockForgotPassword();

      await submitEmail("not-an-email");

      expect(await screen.findByText("Email inválido")).toBeInTheDocument();
      expect(onRequest).not.toHaveBeenCalled();
    });
  });

  it("should send the email and tell the user to check the inbox", async () => {
    const onRequest = mockForgotPassword();

    await submitEmail();

    expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();
    expect(onRequest).toHaveBeenCalledExactlyOnceWith({ email });
    expect(
      screen.getByRole("link", { name: "Voltar para o login" }),
    ).toHaveAttribute("href", "/");
  });

  it("should disable the button while the email is being sent", async () => {
    mockForgotPassword({ responseDelay: 100 });

    await submitEmail();

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
  });

  it.each([
    [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
    [500, "Não foi possível enviar o email. Tente novamente."],
  ])("should show the right message on a %i response", async (status, message) => {
    mockForgotPassword({ status });

    await submitEmail();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText("Confira seu email")).not.toBeInTheDocument();
  });
});
